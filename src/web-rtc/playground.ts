import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

(async () => {
  const room = "grid-unlock-test";

  const ydoc = new Y.Doc();
  new WebrtcProvider(room, ydoc, {
    password: "test",
    // The types are BAD
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  ydoc.get("array", Y.Array);
})();
