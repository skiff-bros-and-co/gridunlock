import { useState } from "react";
import { Cell, PuzzleDefinition } from "../state/Puzzle";
import { PuzzleGameCell, PuzzleState } from "../state/State";
import { PuzzleGrid } from "./PuzzleGrid";

interface Props {
  puzzleDefinition: PuzzleDefinition;
}

const initializeEmptyCell = (cell: Cell): PuzzleGameCell => ({
  author: null,
  filledValue: "",
  isBlocked: cell.isBlocked,
});

const initializePuzzleState = (puzzleDefinition: PuzzleDefinition): PuzzleState => {
  return puzzleDefinition.cells.map((row: Cell[]) => row.map((cell) => initializeEmptyCell(cell)));
};

export const PuzzleView = (props: Props): JSX.Element => {
  const [puzzleState, updatePuzzleState] = useState(initializePuzzleState(props.puzzleDefinition));

  return <PuzzleGrid puzzleState={puzzleState} />;
};
