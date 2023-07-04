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

export const onRequest: PagesFunction<Env> = async ({ env, request }) => {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  let channel: string | undefined;
  const readMessageKeys = new Set<string>();

  server.accept();
  server.addEventListener("message", (event) => {
    const message: YWebRtcSubscriptionMessage | YWebRtcPingMessage | YWebRtcPublishMessage = JSON.parse(
      event.data as string,
    );

    switch (message.type) {
      case "subscribe": {
        const newChannel = message.topics?.[0];
        if (message.topics?.length !== 1 || !(channel == null || channel !== newChannel)) {
          console.log("expected 1 topic");
        } else {
          channel = newChannel;
        }
        break;
      }
      case "unsubscribe": {
        if (message.topics?.length !== 1 || channel !== message.topics?.[0]) {
          console.log("expected 1 topic");
        } else {
          channel = undefined;
        }
        break;
      }
      case "ping": {
        processNewMessages(env, channel!, readMessageKeys, server);

        const msg: YWebRtcPongMessage = { type: "pong" };
        server.send(JSON.stringify(msg));
        break;
      }
      case "publish":
        if (message.topic == null) {
          console.log("no channel");
        } else {
          const key = storeMessage(env, message.topic, event.data as string);
          // readMessageKeys.add(key);
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

async function processNewMessages(env: Env, topic: string, seenKeys: Set<string>, server: WebSocket) {
  const keys = await env.SIGNALING.list({ prefix: `${topic}/` });
  const newKeys = keys.keys.filter((key) => !seenKeys.has(key.name));

  newKeys.forEach(async (key) => {
    seenKeys.add(key.name);

    server.send(await env.SIGNALING.get(key.name));
  });
}

function generateMessageKey(topic: string) {
  const buffer = new Uint32Array(1); // 32 bits is probably enough?
  crypto.getRandomValues(buffer);
  const id = buffer.join("");
  return `${topic}/${id}`;
}
