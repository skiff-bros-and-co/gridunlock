export class SimpleBufferScanner {
  private currentIndex = 0;
  private buffer: Uint8Array;

  constructor(buffer: ArrayBuffer) {
    this.buffer = new Uint8Array(buffer);
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

    const result = this.buffer.subarray(this.currentIndex, end);
    this.currentIndex += byteLength;
    return new DataView(result);
  }

  public readUntil(predicate: (char: number) => boolean): ArrayBuffer {
    const buffer = this.buffer;
    const startIndex = this.currentIndex;
    for (let i = startIndex; i < buffer.byteLength; i++) {
      if (predicate(buffer[i])) {
        this.currentIndex = i + 1;
        return buffer.subarray(startIndex, i);
      }
    }

    this.currentIndex = buffer.length;
    return buffer.subarray(startIndex);
  }

  public readRemaining(): ArrayBuffer {
    const result = this.buffer.subarray(this.currentIndex);
    this.currentIndex += this.buffer.byteLength;
    return result;
  }

  get index() {
    return this.currentIndex;
  }
}
