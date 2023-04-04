import { describe, expect, test } from "vitest";
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
    const puzzle = parseXWord(TEST_XWORD);

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
          1: "Clue #1",
          3: "Clue.With.Periods",
        },
        down: {
          2: "Clue #2",
        },
        byCell: [
          [1, 2, undefined],
          [undefined, undefined, undefined],
          [3, undefined, undefined],
        ],
      });
    });

    test("should parse the cells", () => {
      expect(puzzle.cells).toEqual([
        ["C", "A", "T"],
        [".", "REBUS", "."],
        ["E", "C", "O"],
      ]);
    });
  });
});
