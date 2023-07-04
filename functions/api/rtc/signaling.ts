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
  [k: string]: unknown;
}

interface Env {}

export const onRequest: PagesFunction<Env> = async ({ request }) => {
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
        if (message.topics?.length !== 1 || channel != null) {
          console.log("expected 1 topic");
        } else {
          channel = message.topics?.[0];
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
        break;
      }
      case "publish":
        if (channel == null) {
          console.log("no channel");
        } else {
          console.log("publish", message);
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
