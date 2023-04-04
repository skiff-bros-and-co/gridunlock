import { describe, expect, test } from "vitest";

import { CellDefinition } from "../../src/state/Puzzle";
import { buildCellCluesByRowAndColumn } from "../../src/state/PuzzleDataBuilder";

describe("PuzzleDataBuilder", () => {
  describe("buildCellCluesByRowAndColumn", () => {
    test("should build correct clue 2d array", () => {
      const givenCells: CellDefinition[][] = [
        [
          { row: 0, column: 0, initialState: "", isBlocked: false, clueNumber: 1, solution: "G" },
          { row: 0, column: 1, initialState: "", isBlocked: false, clueNumber: 2, solution: "O" },
        ],
        [
          { row: 1, column: 0, initialState: "", isBlocked: false, clueNumber: 3, solution: "A" },
          { row: 1, column: 1, initialState: "", isBlocked: false, clueNumber: undefined, solution: "N" },
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

    test("should handle single word cells", () => {
      const givenCells: CellDefinition[][] = [
        [
          { row: 0, column: 0, initialState: "", isBlocked: false, clueNumber: 1, solution: "G" },
          { row: 0, column: 1, initialState: "", isBlocked: false, clueNumber: undefined, solution: "O" },
        ],
        [
          { row: 1, column: 0, initialState: "", isBlocked: false, clueNumber: undefined, solution: "O" },
          { row: 1, column: 1, initialState: "", isBlocked: true, clueNumber: undefined, solution: "." },
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
            downClueNumber: undefined,
          },
        ],
        [
          {
            isStartOfClue: false,
            acrossClueNumber: undefined,
            downClueNumber: 1,
          },
          undefined,
        ],
      ]);
    });
  });
});
