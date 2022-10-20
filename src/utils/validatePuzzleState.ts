import { PuzzleDefinition } from "../state/Puzzle";
import { PuzzleState } from "../state/State";

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

      if (cellState.filledValue !== cell.solution) {
        return "incorrect";
      }

      return "correct";
    }),
  );
}
