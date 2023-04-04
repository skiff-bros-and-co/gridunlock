export class SimpleBufferScanner {
  private currentIndex = 0;
  private buffer: ArrayBuffer;

  constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
  }

  public moveTo(index: number) {
    this.currentIndex = index;
  }

  public read(byteLength: number): DataView {
    let end = this.currentIndex + byteLength;
    if (end > this.buffer.byteLength) {
      console.error("Attempted to read past end of buffer");
      byteLength = this.buffer.byteLength - this.currentIndex;
      end = this.buffer.byteLength;
    }

    const result = this.buffer.slice(this.currentIndex, end);
    this.currentIndex += byteLength;
    return new DataView(result);
  }

  public readUntil(predicate: (char: number) => boolean): DataView {
    const buffer = this.buffer;
    const charView = new Uint8Array(buffer);
    const startIndex = this.currentIndex;
    for (let i = startIndex; i < buffer.byteLength; i++) {
      if (predicate(charView[i])) {
        this.currentIndex = i + 1;
        return new DataView(buffer.slice(startIndex, i));
      }
    }

    this.currentIndex = buffer.byteLength;
    return new DataView(buffer.slice(startIndex));
  }

  public readRemaining(): DataView {
    const result = this.buffer.slice(this.currentIndex);
    this.currentIndex = this.buffer.byteLength;
    return new DataView(result);
  }

  get index() {
    return this.currentIndex;
  }
}
