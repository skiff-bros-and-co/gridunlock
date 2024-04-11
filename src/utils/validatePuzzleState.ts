import type { PuzzleDefinition } from "../state/Puzzle";
import type { PuzzleState } from "../state/State";

export type CellValidState = "incorrect" | "correct" | "empty";

export function validatePuzzleState(puzzleState: PuzzleState, puzzle: PuzzleDefinition): CellValidState[][] {
  return puzzle.cells.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const cellState = puzzleState[rowIndex][colIndex];
      if (cellState.isBlocked) {
        return "correct";
      }

      if (cellState.filledValue === "") {
        return "empty";
      }

      // NOTE: This allows rebus' answers to match any of the valid letters
      if (!cell.solution.includes(cellState.filledValue)) {
        return "incorrect";
      }

      return "correct";
    }),
  );
}
