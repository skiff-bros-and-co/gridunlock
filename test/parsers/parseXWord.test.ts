import { describe, expect, test } from "vitest";
import { parseIntermediatePuzzle } from "../../src/parsers/parseIntermediatePuzzle";
import { XWordInfoJsonFormat, parseXWord } from "../../src/parsers/parseXWord";

const TEST_XWORD: XWordInfoJsonFormat = {
  title: "Test Puzzle",
  author: "Test Author",
  editor: "Test Editor",
  copyright: "Copyright (C) 2023",
  publisher: "Test Publisher",
  date: "4/20/2023",
  size: { rows: 3, cols: 3 },
  circles: [0, 1, 0, 0, 1, 0, 0, 1, 0],
  notepad: "test notes",
  grid: ["C", "A", "T", ".", "REBUS", ".", "E", "C", "O"],
  gridnums: [1, 2, 0, 0, 0, 0, 3, 0, 0],
  clues: {
    across: ["1. Clue #1", "3. Clue.With.Periods"],
    down: ["2. Clue #2"],
  },
};

describe("parseXWord", () => {
  describe("when parsing a simple puzzle", () => {
    const puzzle = parseIntermediatePuzzle(parseXWord(TEST_XWORD));

    test("should parse the title", () => {
      expect(puzzle.title).toEqual("Test Puzzle");
    });

    test("should parse the author", () => {
      expect(puzzle.author).toEqual("Test Author");
    });

    test("should parse the width and height", () => {
      expect(puzzle.width).toEqual(3);
      expect(puzzle.height).toEqual(3);
    });

    test("should parse the description", () => {
      expect(puzzle.description).toEqual("test notes");
    });

    test("should parse the copyright", () => {
      expect(puzzle.copyright).toEqual("Copyright (C) 2023");
    });

    test("should parse the clues", () => {
      expect(puzzle.clues).toEqual({
        across: {
          1: {
            clue: "Clue #1",
            clueNumber: 1,
            direction: "across",
            position: {
              row: 0,
              column: 0,
            },
          },
          3: {
            clue: "Clue.With.Periods",
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
            clue: "Clue #2",
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
      expect(puzzle.cells).toEqual([
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
            solution: "REBUS",
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
