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
  data: string;
}

interface Env {
  SIGNALING: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async ({ env, request }) => {
  console.log("request", JSON.stringify(request.headers, null, 2));

  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  let channel: string | undefined;

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
        const msg: YWebRtcPongMessage = { type: "pong" };
        server.send(JSON.stringify(msg));
        server.send(generateMessageId());
        break;
      }
      case "publish":
        if (message.topic) {
          console.log("no channel");
        } else {
          console.log("publish", message);
          storeMessage(env, message.topic, message.data);
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
  const id = generateMessageId();
  const key = getMessageKey(topic, id);
  env.SIGNALING.put(key, message, {
    // We only need messages to last long enough for the client to receive them
    expirationTtl: 60 * 10, // seconds
  });
  return id;
}

function getMessageKey(topic: string, id: string): string {
  return `${topic}/${id}`;
}

function generateMessageId() {
  const buffer = new Uint32Array(1); // 32 bits is probably enough?
  crypto.getRandomValues(buffer);
  return buffer.join("");
}
