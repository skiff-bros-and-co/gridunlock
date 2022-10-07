// see https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels#concerns_with_large_messages
const MAX_CHUNK_BYTES = 8 * 1024;
const DEFAULT_BUFFERED_AMOUNT_LOW_BYTES = 64 * 1024;

const FOOTER_LENGTH_BYTE =
  4 + // messageBytes (UINT32)
  4; // messageId (UINT32)

export function wrapRTCDataChannel(delegate: RTCDataChannel): RTCDataChannel {
  const rawSend = delegate.send.bind(delegate);

  delegate.send = createQueuedSender(delegate, rawSend);

  const onmessage = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(delegate), "onmessage")!.set!.bind(delegate);
  Object.defineProperty(delegate, "onmessage", {
    set(value: ((ev: MessageEvent) => unknown) | null) {
      bindChunkedMessageReader(onmessage, value!);
    },
  });

  return delegate;
}

function createQueuedSender(delegate: RTCDataChannel, rawSend: RTCDataChannel["send"]) {
  delegate.bufferedAmountLowThreshold = delegate.bufferedAmountLowThreshold ?? DEFAULT_BUFFERED_AMOUNT_LOW_BYTES;

  const maxChunkContentSize = MAX_CHUNK_BYTES - FOOTER_LENGTH_BYTE;
  const queuedMessages: Uint8Array[] = [];
  const chunkBuffer = new ArrayBuffer(MAX_CHUNK_BYTES);
  const chunkBufferView = new DataView(chunkBuffer);

  let nextMessageId = 0;
  let currentMessage:
    | {
        messageId: number;
        messageBytes: number;
        remaining: Uint8Array;
        nextChunkId: number;
      }
    | undefined;
  function send() {
    if (delegate.bufferedAmount > delegate.bufferedAmountLowThreshold) {
      return;
    }

    if (currentMessage == null || currentMessage.remaining.byteLength === 0) {
      if (queuedMessages.length === 0) {
        return;
      }

      const nextMessage = queuedMessages.shift()!;
      currentMessage = {
        messageId: nextMessageId++,
        remaining: nextMessage,
        messageBytes: nextMessage.byteLength,
        nextChunkId: 0,
      };
    }

    const chunkContentSize = Math.min(currentMessage.remaining.byteLength, maxChunkContentSize);

    // Copy the next chunk into the buffer
    const chunkContent = new Uint8Array(
      currentMessage.remaining.buffer,
      currentMessage.remaining.byteOffset,
      chunkContentSize,
    );
    new Uint8Array(chunkBuffer).set(chunkContent);

    // Add the footer to the buffer
    chunkBufferView.setUint32(chunkContentSize, currentMessage.messageBytes);
    chunkBufferView.setUint32(chunkContentSize + 4, currentMessage.messageId);

    const chunkData = new Uint8Array(chunkBuffer, 0, chunkContentSize + FOOTER_LENGTH_BYTE);
    rawSend(chunkData);

    if (currentMessage.remaining.byteLength === chunkContentSize) {
      currentMessage = undefined;
    } else {
      currentMessage.remaining = new Uint8Array(
        currentMessage.remaining.buffer,
        currentMessage.remaining.byteOffset + chunkContentSize,
      );
    }

    queueMicrotask(send);
  }

  delegate.addEventListener("bufferedamountlow", send);

  return (data: string | Blob | ArrayBuffer | ArrayBufferView): void => {
    if (delegate.readyState !== "open") {
      throw new Error("RTCDataChannel.readyState is not 'open'");
    }

    if (typeof data === "string" || data instanceof Blob) {
      throw new Error("Unsupported");
    }

    if (data instanceof ArrayBuffer) {
      queuedMessages.push(new Uint8Array(data));
    } else {
      queuedMessages.push(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
    }
    send();
  };
}

function bindChunkedMessageReader(
  setOnmessage: (handler: (ev: MessageEvent) => unknown) => void,
  callback: (ev: MessageEvent) => unknown,
) {
  let currentMessage:
    | {
        messageId: number;
        buffer: Uint8Array;
        bufferOffset: number;
      }
    | undefined;
  setOnmessage((ev) => {
    const data = ev.data as ArrayBuffer;
    const dataView = new DataView(data);

    // Read footer
    const footerOffset = data.byteLength - FOOTER_LENGTH_BYTE;
    const messageLength = dataView.getUint32(footerOffset);
    const messageId = dataView.getUint32(footerOffset + 4);

    if (messageId !== currentMessage?.messageId) {
      if (currentMessage != null) {
        callback({
          ...ev,
          data: currentMessage.buffer,
        });
      }

      currentMessage = {
        messageId,
        buffer: new Uint8Array(messageLength),
        bufferOffset: 0,
      };
    }

    const chunkContentSize = data.byteLength - FOOTER_LENGTH_BYTE;

    // Copy the chunk into the buffer
    const chunkData = new Uint8Array(data, 0, chunkContentSize);
    currentMessage.buffer.set(chunkData, currentMessage.bufferOffset);
    currentMessage.bufferOffset += chunkContentSize;
  });
}
