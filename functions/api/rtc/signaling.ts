interface YWebRtcSubscriptionMessage {
  type: "subscribe" | "unsubscribe";
  topics?: string[];
}
interface YWebRtcPingMessage {
  type: "ping";
}

interface YWebRtcPongMessage {
  type: "pong";
}
interface YWebRtcPublishMessage {
  type: "publish";
  topic?: string;
  data: unknown;
}

interface Env {
  SIGNALING: KVNamespace;
  SIGNALING_MSG_TTL_SEC: string;
}

const MESSAGE_POLLING_RATE_SEC = 1000;

export const onRequest: PagesFunction<Env> = async ({ env, request }) => {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  let topic: string | undefined;
  let pollingToken: number | undefined;
  const readMessageKeys = new Set<string>();

  server.accept();
  server.addEventListener("message", (event) => {
    const message: YWebRtcSubscriptionMessage | YWebRtcPingMessage | YWebRtcPublishMessage = JSON.parse(
      event.data as string,
    );

    switch (message.type) {
      case "subscribe": {
        const newChannel = message.topics?.[0];
        if (message.topics?.length !== 1 || !(topic == null || topic !== newChannel)) {
          console.log("expected 1 topic");
        } else if (topic !== newChannel) {
          topic = newChannel;
          pollingToken = setInterval(
            () => processNewMessages(env, topic, readMessageKeys, server),
            MESSAGE_POLLING_RATE_SEC,
          );
        }
        break;
      }
      case "unsubscribe": {
        if (message.topics?.length !== 1 || topic !== message.topics?.[0]) {
          console.log("expected 1 topic");
        } else {
          topic = undefined;
          clearInterval(pollingToken);
          pollingToken = undefined;
        }
        break;
      }
      case "ping": {
        const msg: YWebRtcPongMessage = { type: "pong" };
        server.send(JSON.stringify(msg));
        break;
      }
      case "publish":
        if (message.topic == null) {
          console.log("no channel");
        } else {
          const key = storeMessage(env, message.topic, event.data as string);
          readMessageKeys.add(key);
        }
        break;
      default:
        console.log("unknown message type", message);
    }
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
};

function storeMessage(env: Env, topic: string, message: string): string {
  const messageTtlSec = Number(env.SIGNALING_MSG_TTL_SEC);
  if (isNaN(messageTtlSec) || messageTtlSec <= 0) {
    throw new Error("SIGNALING_MSG_TTL_SEC must be a positive number");
  }

  const key = generateMessageKey(topic);
  env.SIGNALING.put(key, message, {
    // We only need messages to last long enough for the client to receive them
    expirationTtl: messageTtlSec,
  });
  return key;
}

async function processNewMessages(env: Env, topic: string, readMessageKeys: Set<string>, server: WebSocket) {
  const keys = await env.SIGNALING.list({ prefix: `${topic}/` });
  const newKeys = keys.keys.filter((key) => !readMessageKeys.has(key.name));
  keys.keys.forEach((key) => readMessageKeys.add(key.name));
  newKeys.forEach(async (key) => {
    readMessageKeys.add(key.name);

    console.info(key.name, key.expiration);

    server.send(await env.SIGNALING.get(key.name));
  });
}

function generateMessageKey(topic: string) {
  const buffer = new Uint32Array(1); // 32 bits is probably enough?
  crypto.getRandomValues(buffer);
  const id = buffer.join("");
  return `${topic}/${id}`;
}
