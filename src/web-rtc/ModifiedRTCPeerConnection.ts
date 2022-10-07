import { wrapRTCDataChannel } from "./wrapRTCDataChannel";

function InternalRTCPeerConnection(configuration?: RTCConfiguration): RTCPeerConnection {
  const delegate = new RTCPeerConnection(configuration);
  const rawCreateDataChannel = delegate.createDataChannel.bind(delegate);

  delegate.createDataChannel = (label: string, dataChannelDict?: RTCDataChannelInit): RTCDataChannel => {
    return wrapRTCDataChannel(rawCreateDataChannel(label, dataChannelDict));
  };

  const ondatachannel = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(delegate), "ondatachannel")!.set!.bind(
    delegate,
  );
  Object.defineProperty(delegate, "ondatachannel", {
    set(value: ((ev: RTCDataChannelEvent) => unknown) | null) {
      ondatachannel((ev: RTCDataChannelEvent) => {
        value?.({
          ...ev,
          channel: wrapRTCDataChannel(ev.channel),
        });
      });
    },
  });

  return delegate;
}
Object.assign(InternalRTCPeerConnection, RTCPeerConnection);

export const ModifiedRTCPeerConnection = InternalRTCPeerConnection as unknown as typeof RTCPeerConnection;
