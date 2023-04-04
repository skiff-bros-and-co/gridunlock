import fs from "fs";
import { describe, expect, test } from "vitest";
import { parseIntermediatePuzzle } from "../../src/parsers/parseIntermediatePuzzle";
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
    const parsed = parseIntermediatePuzzle(parsePuz(simpleTestPuz));

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
          1: {
            clue: "clue 1",
            clueNumber: 1,
            direction: "across",
            position: {
              row: 0,
              column: 0,
            },
          },
          "3": {
            clue: "clue 3",
            clueNumber: 3,
            direction: "across",
            position: {
              column: 0,
              row: 2,
            },
          },
        },
        down: {
          2: {
            clue: "clue 2",
            clueNumber: 2,
            direction: "down",
            position: {
              row: 0,
              column: 1,
            },
          },
        },
        byRowAndColumn: [
          [
            {
              isStartOfClue: true,
              acrossClueNumber: 1,
              downClueNumber: undefined,
            },
            {
              isStartOfClue: true,
              acrossClueNumber: 1,
              downClueNumber: 2,
            },
            {
              isStartOfClue: false,
              acrossClueNumber: 1,
              downClueNumber: undefined,
            },
          ],
          [
            undefined,
            {
              isStartOfClue: false,
              acrossClueNumber: undefined,
              downClueNumber: 2,
            },
            undefined,
          ],
          [
            {
              isStartOfClue: true,
              acrossClueNumber: 3,
              downClueNumber: undefined,
            },
            {
              isStartOfClue: false,
              acrossClueNumber: 3,
              downClueNumber: 2,
            },
            {
              isStartOfClue: false,
              acrossClueNumber: 3,
              downClueNumber: undefined,
            },
          ],
        ],
        clueCount: 3,
      });
    });

    test("should parse the cells", () => {
      expect(parsed.cells).toEqual([
        [
          {
            column: 0,
            row: 0,
            solution: "C",
            isBlocked: false,
            clueNumber: 1,
          },
          {
            column: 1,
            row: 0,
            solution: "A",
            isBlocked: false,
            clueNumber: 2,
          },
          {
            column: 2,
            row: 0,
            solution: "T",
            isBlocked: false,
            clueNumber: undefined,
          },
        ],
        [
          {
            column: 0,
            row: 1,
            solution: ".",
            isBlocked: true,
            clueNumber: undefined,
          },
          {
            column: 1,
            row: 1,
            solution: "B",
            isBlocked: false,
            clueNumber: undefined,
          },
          {
            column: 2,
            row: 1,
            solution: ".",
            isBlocked: true,
            clueNumber: undefined,
          },
        ],
        [
          {
            column: 0,
            row: 2,
            solution: "E",
            isBlocked: false,
            clueNumber: 3,
          },
          {
            column: 1,
            row: 2,
            solution: "C",
            isBlocked: false,
            clueNumber: undefined,
          },
          {
            column: 2,
            row: 2,
            solution: "O",
            isBlocked: false,
            clueNumber: undefined,
          },
        ],
      ]);
    });
  });
});
