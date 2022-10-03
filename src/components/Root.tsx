import { PuzzleDefinition } from "../state/Puzzle";
import { PuzzleView } from "./PuzzleView";

const testPuzzleData: PuzzleDefinition = {
  title: "Test Puzzle",
  author: "Me",
  description: "This is a puzzle",
  copyright: "You hereby agree to give me money",
  clues: {
    across: {
      1: {
        clue: "Disney movie that makes you think about the transience of life, and reconsider your priorities in like 2 minutes.",
        direction: "across",
        clueNumber: 1,
        position: {
          row: 0,
          column: 2,
        },
      },
      4: {
        clue: "___ do a cross-word, consider donating to the devs, and achieve inner peace.",
        direction: "across",
        clueNumber: 4,
        position: {
          row: 1,
          column: 2,
        },
      },
      5: {
        clue: '"What are we having for dinner?"',
        direction: "across",
        clueNumber: 5,
        position: {
          row: 0,
          column: 3,
        },
      },
    },
    down: {
      1: {
        clue: "Like a knock-off basic boot",
        direction: "down",
        clueNumber: 1,
        position: {
          row: 0,
          column: 2,
        },
      },
      2: {
        clue: "Butt stuff",
        direction: "down",
        clueNumber: 2,
        position: {
          row: 0,
          column: 3,
        },
      },
      3: {
        clue: 'Places you go after saying "hold my beer"',
        direction: "down",
        clueNumber: 3,
        position: {
          row: 1,
          column: 0,
        },
      },
    },
    clueCount: 5,
  },
  width: 4,
  height: 4,
  cells: [
    [
      { row: 0, column: 0, initialState: ".", isBlocked: true, solution: "." },
      { row: 0, column: 1, initialState: ".", isBlocked: true, solution: "." },
      { row: 0, column: 2, initialState: "", isBlocked: false, clueNumber: 1, solution: "U" },
      { row: 0, column: 3, initialState: "", isBlocked: false, clueNumber: 2, solution: "P" },
    ],
    [
      { row: 1, column: 0, initialState: "", isBlocked: false, clueNumber: 3, solution: "E" },
      { row: 1, column: 1, initialState: ".", isBlocked: true, solution: "." },
      { row: 1, column: 2, initialState: "", isBlocked: false, clueNumber: 4, solution: "G" },
      { row: 1, column: 3, initialState: "", isBlocked: false, solution: "O" },
    ],
    [
      { row: 2, column: 0, initialState: "", isBlocked: false, solution: "R" },
      { row: 2, column: 1, initialState: ".", isBlocked: true, solution: "." },
      { row: 2, column: 2, initialState: ".", isBlocked: true, solution: "." },
      { row: 2, column: 3, initialState: "", isBlocked: false, solution: "O" },
    ],
    [
      { row: 0, column: 0, initialState: "", isBlocked: false, clueNumber: 5, solution: "S" },
      { row: 0, column: 0, initialState: "", isBlocked: false, solution: "O" },
      { row: 0, column: 0, initialState: "", isBlocked: false, solution: "U" },
      { row: 0, column: 0, initialState: "", isBlocked: false, solution: "P" },
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
