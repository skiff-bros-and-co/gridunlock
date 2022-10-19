import { describe, expect, it } from "@jest/globals";
import { Cell } from "./Puzzle";
import { buildCellCluesByRowAndColumn } from "./PuzzleDataBuilder";

describe("PuzzleDataBuilder", () => {
  describe("buildCellCluesByRowAndColumn", () => {
    it("should build correct clue 2d array", () => {
      const givenCells: Cell[][] = [
        [
          { row: 0, column: 0, initialState: "", isBlocked: false, clueNumber: 1, solution: "G" },
          { row: 0, column: 1, initialState: "", isBlocked: false, clueNumber: 2, solution: "O" },
        ],
        [
          { row: 1, column: 0, initialState: "", isBlocked: false, clueNumber: 3, solution: "A" },
          { row: 1, column: 1, initialState: "", isBlocked: false, solution: "N" },
        ],
      ];

      const actualClues = buildCellCluesByRowAndColumn(givenCells);

      expect(actualClues).toStrictEqual([
        [
          {
            isStartOfClue: true,
            acrossClueNumber: 1,
            downClueNumber: 1,
          },
          {
            isStartOfClue: true,
            acrossClueNumber: 1,
            downClueNumber: 2,
          },
        ],
        [
          {
            isStartOfClue: true,
            acrossClueNumber: 3,
            downClueNumber: 1,
          },
          {
            isStartOfClue: false,
            acrossClueNumber: 3,
            downClueNumber: 2,
          },
        ],
      ]);
    });

    it("should handle single word cells", () => {
      const givenCells: Cell[][] = [
        [
          { row: 0, column: 0, initialState: "", isBlocked: false, clueNumber: 1, solution: "G" },
          { row: 0, column: 1, initialState: "", isBlocked: false, solution: "O" },
        ],
        [
          { row: 1, column: 0, initialState: "", isBlocked: false, solution: "O" },
          { row: 1, column: 1, initialState: "", isBlocked: true, solution: "." },
        ],
      ];

      const actualClues = buildCellCluesByRowAndColumn(givenCells);

      expect(actualClues).toStrictEqual([
        [
          {
            isStartOfClue: true,
            acrossClueNumber: 1,
            downClueNumber: 1,
          },
          {
            isStartOfClue: false,
            acrossClueNumber: 1,
            downClueNumber: null,
          },
        ],
        [
          {
            isStartOfClue: false,
            acrossClueNumber: null,
            downClueNumber: 1,
          },
          null,
        ],
      ]);
    });
  });
});
