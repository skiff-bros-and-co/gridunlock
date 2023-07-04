import SimplePeer from "simple-peer";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { ModifiedRTCPeerConnection } from "./ModifiedRTCPeerConnection";

type WebrtcProviderOptions = Partial<ConstructorParameters<typeof WebrtcProvider>[2]>;

export function createWebRtcProvider(opts: {
  roomName: string;
  doc: Y.Doc;
  iceServers: RTCIceServer[];
}): WebrtcProvider {
  const peerOpts: SimplePeer.Options = {
    wrtc: {
      RTCIceCandidate,
      RTCSessionDescription,
      RTCPeerConnection: ModifiedRTCPeerConnection,
    },
    config: {
      iceServers: opts.iceServers,
    },
  };

  const origin = window.location.hostname;
  const webRtcOptions: WebrtcProviderOptions = {
    peerOpts,
    maxConns: 20 + Math.floor(Math.random() * 15),
    filterBcConns: true,
    signaling: [`wss://${origin}/api/rtc/signaling`],
  };

  // Types are bad
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new WebrtcProvider(opts.roomName, opts.doc, webRtcOptions as any);
}
