interface Env {}

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();
  server.addEventListener("message", (event) => {
    console.log(event.data);
    client.send("Hello from the server!");
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
};
