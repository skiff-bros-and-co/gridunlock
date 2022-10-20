import { PuzzleDefinition } from "../state/Puzzle";
import { PuzzleState } from "../state/State";
import { validatePuzzleState } from "./validatePuzzleState";

export function isPuzzleComplete(puzzleState: PuzzleState, puzzle: PuzzleDefinition) {
  return validatePuzzleState(puzzleState, puzzle).every((row) => row.every((cell) => cell === "correct"));
}
