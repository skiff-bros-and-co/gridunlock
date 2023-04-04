import { describe, expect, test } from "vitest";
import { SimpleBufferScanner } from "../../src/parsers/SimpleBufferScanner";

function toBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

function expectDataViewEqualsString(actual: DataView, expected: string): void {
  const encoder = new TextDecoder();
  expect(encoder.decode(actual)).toEqual(expected);
}

describe("SimpleBufferScanner", () => {
  describe("moveTo", () => {
    test("should move the index", () => {
      const scanner = new SimpleBufferScanner(toBuffer("abc"));
      expect(scanner.index).toEqual(0);
      scanner.moveTo(1);
      expect(scanner.index).toEqual(1);
      scanner.moveTo(2);
      expect(scanner.index).toEqual(2);
      scanner.moveTo(3);
      expect(scanner.index).toEqual(3);
    });
  });

  describe("read", () => {
    test("should return the next character", () => {
      const scanner = new SimpleBufferScanner(toBuffer("abc"));
      expectDataViewEqualsString(scanner.read(1), "a");
      expectDataViewEqualsString(scanner.read(1), "b");
      expectDataViewEqualsString(scanner.read(1), "c");
      expectDataViewEqualsString(scanner.read(1), "");
      expectDataViewEqualsString(scanner.read(1), "");
    });

    test("should return the next n characters", () => {
      const scanner = new SimpleBufferScanner(toBuffer("abc"));
      expectDataViewEqualsString(scanner.read(2), "ab");
      expectDataViewEqualsString(scanner.read(2), "c");
      expectDataViewEqualsString(scanner.read(2), "");
      expectDataViewEqualsString(scanner.read(2), "");
    });

    test("should start from the current index", () => {
      const scanner = new SimpleBufferScanner(toBuffer("abc"));
      scanner.moveTo(1);
      expectDataViewEqualsString(scanner.read(1), "b");
      expectDataViewEqualsString(scanner.read(1), "c");
      expectDataViewEqualsString(scanner.read(1), "");
    });

    test("should move the current index", () => {
      const scanner = new SimpleBufferScanner(toBuffer("abc"));
      expect(scanner.index).toEqual(0);
      scanner.read(1);
      expect(scanner.index).toEqual(1);
      scanner.read(2);
      expect(scanner.index).toEqual(3);
      scanner.read(1);
      expect(scanner.index).toEqual(3);
    });
  });

  describe("readRemaining", () => {
    test("should return the remaining characters", () => {
      const scanner = new SimpleBufferScanner(toBuffer("abc"));
      expectDataViewEqualsString(scanner.readRemaining(), "abc");
      expectDataViewEqualsString(scanner.readRemaining(), "");
    });

    test("should return the remaining characters at the current index", () => {
      const scanner = new SimpleBufferScanner(toBuffer("abc"));
      scanner.moveTo(1);
      expectDataViewEqualsString(scanner.readRemaining(), "bc");
      expectDataViewEqualsString(scanner.readRemaining(), "");
    });

    test("should mvoe the current index", () => {
      const scanner = new SimpleBufferScanner(toBuffer("abc"));
      expect(scanner.index).toEqual(0);
      scanner.readRemaining();
      expect(scanner.index).toEqual(3);
      scanner.readRemaining();
      expect(scanner.index).toEqual(3);
    });
  });
});
