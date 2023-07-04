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

  server.accept();
  server.addEventListener("message", (event) => {
    const message: YWebRtcSubscriptionMessage | YWebRtcPingMessage | YWebRtcPublishMessage | { type: unknown } =
      JSON.parse(event.data as string);

    switch (message.type) {
      case "subscribe":
      case "unsubscribe":
      case "ping": {
        const msg: YWebRtcPongMessage = { type: "pong" };
        server.send(JSON.stringify(msg));
        break;
      }
      case "publish":
        break;
      default:
        console.log("unknown message type", message.type);
    }
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
};
