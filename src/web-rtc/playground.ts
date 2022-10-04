import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import * as awarenessProtocol from "y-protocols/awareness.js";

(async () => {
  const room = "1";

  const ydoc = new Y.Doc();
  // clients connected to the same room-name share document updates
  const provider = new WebrtcProvider(room, ydoc, {
    signaling: ["wss://gridunlock-signal.herokuapp.com/"],
    password: null,
    awareness: new awarenessProtocol.Awareness(ydoc),
    filterBcConns: null,
    maxConns: null,
    peerOpts: null,
  });
  const yarray = ydoc.get("array", Y.Array);
})();
