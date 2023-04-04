import fs from "fs";
import { describe, expect, test } from "vitest";
import { parsePuz } from "../../src/parsers/parsePuz";

/**
 * Converts a Node.js Buffer to an ArrayBuffer
 * @param buffer A Node.js Buffer containing a .puz file
 */
function convertBufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}

describe("parsePuz", () => {
  // parsePuz(buffer) takes an ArrayBuffer containing a .puz file
  // and returns a parsed puzzle object

  describe("when parsing a simple puzzle", () => {
    const simpleTestPuz = convertBufferToArrayBuffer(fs.readFileSync(__dirname + "/simple-generated.puz"));
    const parsed = parsePuz(simpleTestPuz);

    test("should parse the title", () => {
      expect(parsed.title).toEqual("Simple Test");
    });

    test("should parse the author", () => {
      expect(parsed.author).toEqual("Test Author");
    });

    test("should parse the width and height", () => {
      expect(parsed.width).toEqual(3);
      expect(parsed.height).toEqual(3);
    });

    test("should parse the description", () => {
      expect(parsed.description).toEqual("This is a test note");
    });

    test("should parse the copyright", () => {
      expect(parsed.copyright).toEqual("Copyright (C) 2023");
    });

    test("should parse the clues", () => {
      expect(parsed.clues).toEqual({
        across: {
          1: "clue 1",
          3: "clue 3",
        },
        down: {
          2: "clue 2",
        },
        byCell: [
          [1, 2, undefined],
          [undefined, undefined, undefined],
          [3, undefined, undefined],
        ],
      });
    });

    test("should parse the cells", () => {
      expect(parsed.cells).toEqual([
        ["C", "A", "T"],
        [".", "B", "."],
        ["E", "C", "O"],
      ]);
    });
  });
});
