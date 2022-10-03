import { useState } from "react";
import { Cell, PuzzleDefinition } from "../state/Puzzle";
import { PuzzleGameCell, PuzzleState } from "../state/State";
import { PuzzleGrid } from "./PuzzleGrid";
import update from "immutability-helper";
import { PuzzleHints } from "./PuzzleHints";

interface Props {
  puzzleDefinition: PuzzleDefinition;
}

const initializeEmptyCell = (cell: Cell): PuzzleGameCell => ({
  author: null,
  filledValue: "",
  isBlocked: cell.isBlocked,
  clueNumber: cell.clueNumber,
});

const initializePuzzleState = (puzzleDefinition: PuzzleDefinition): PuzzleState => {
  return puzzleDefinition.cells.map((row: Cell[]) => row.map((cell) => initializeEmptyCell(cell)));
};

export const PuzzleView = (props: Props): JSX.Element => {
  const [puzzleState, updatePuzzleState] = useState(initializePuzzleState(props.puzzleDefinition));

  return (
    <div className="puzzle-view">
      <PuzzleGrid
        puzzleState={puzzleState}
        puzzleWidth={props.puzzleDefinition.width}
        onEnterValue={(row, col, newValue) => {
          const newPuzzleState = update(puzzleState, {
            [row]: {
              [col]: {
                filledValue: {
                  // TODO: set author here
                  $set: newValue,
                },
              },
            },
          });

          updatePuzzleState(newPuzzleState);
        }}
      />
      <PuzzleHints puzzleDefinition={props.puzzleDefinition} />
    </div>
  );
};
