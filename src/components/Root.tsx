import { PuzzleDefinition } from "../state/Puzzle";
import type { PuzzleGameCell } from "../state/State";
import { PuzzleGrid } from "./PuzzleGrid";
import { PuzzleView } from "./PuzzleView";

// title: string;
//   author: string;
//   description: string;
//   copyright: string;
//   cells: Cell[][];
//   clues: PuzzleClues;
//   width: number;
//   height: number;

// solution: SingleLetter | ".";
// initialState: SingleLetter | "" | ".";
// isBlocked: boolean;

// clueNumber?: number;

const testPuzzleData: PuzzleDefinition = {
  title: "Test Puzzle",
  author: "Me",
  description: "This is a puzzle",
  copyright: "You hereby agree to give me money",
  clues: {} as any,
  cells: [
    [
      { row: 0, column: 0, initialState: "", isBlocked: false, clueNumber: 0, solution: "T" },
      { row: 0, column: 1, initialState: "", isBlocked: false, clueNumber: 0, solution: "O" },
      { row: 0, column: 2, initialState: ".", isBlocked: true, clueNumber: 0, solution: "." },
      { row: 0, column: 3, initialState: "", isBlocked: false, clueNumber: 0, solution: "Z" },
    ],
    [
      { row: 1, column: 0, initialState: ".", isBlocked: true, clueNumber: 0, solution: "." },
      { row: 1, column: 1, initialState: "", isBlocked: false, clueNumber: 0, solution: "N" },
      { row: 1, column: 2, initialState: "", isBlocked: false, clueNumber: 0, solution: "O" },
      { row: 1, column: 3, initialState: "", isBlocked: false, clueNumber: 0, solution: "Z" },
    ],
    [
      { row: 2, column: 0, initialState: ".", isBlocked: true, clueNumber: 0, solution: "." },
      { row: 2, column: 1, initialState: ".", isBlocked: true, clueNumber: 0, solution: "." },
      { row: 2, column: 2, initialState: "", isBlocked: false, clueNumber: 0, solution: "F" },
      { row: 2, column: 3, initialState: "", isBlocked: false, clueNumber: 0, solution: "Z" },
    ],
    [
      { row: 0, column: 0, initialState: ".", isBlocked: true, clueNumber: 0, solution: "." },
      { row: 0, column: 0, initialState: ".", isBlocked: true, clueNumber: 0, solution: "." },
      { row: 0, column: 0, initialState: "", isBlocked: false, clueNumber: 0, solution: "F" },
      { row: 0, column: 0, initialState: "", isBlocked: false, clueNumber: 0, solution: "Z" },
    ],
  ],
};

export function Root() {
  return (
    <div className="root">
      <PuzzleView puzzleDefinition={testPuzzleData}></PuzzleView>
    </div>
  );
}
