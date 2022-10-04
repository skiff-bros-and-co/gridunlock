import { useState } from "react";
import { Cell, CellPosition, PuzzleDefinition } from "../state/Puzzle";
import { PuzzleGameCell, PuzzleState } from "../state/State";
import { PuzzleGrid } from "./PuzzleGrid";
import update from "immutability-helper";
import { PuzzleHints } from "./PuzzleHints";
import { useKeypress } from "./Hooks";

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

const getValidNewCellPosition = (
  currentCell: CellPosition,
  newCell: CellPosition,
  puzzleDefinition: PuzzleDefinition,
): CellPosition => {
  if (
    newCell.column > puzzleDefinition.width - 1 ||
    newCell.column < 0 ||
    newCell.row > puzzleDefinition.height - 1 ||
    newCell.row < 0 ||
    puzzleDefinition.cells[newCell.row][newCell.column].isBlocked
  ) {
    return currentCell;
  }
  return newCell;
};

export const PuzzleView = (props: Props): JSX.Element => {
  const [puzzleState, updatePuzzleState] = useState(initializePuzzleState(props.puzzleDefinition));
  const [selectedCell, updateSelectedCell] = useState<CellPosition | null>(null);
  useKeypress(
    "ArrowUp",
    () => {
      if (selectedCell) {
        updateSelectedCell(
          getValidNewCellPosition(
            selectedCell,
            {
              ...selectedCell,
              row: selectedCell.row - 1,
            },
            props.puzzleDefinition,
          ),
        );
      }
    },
    [selectedCell, updateSelectedCell, props.puzzleDefinition],
  );
  useKeypress(
    "ArrowDown",
    () => {
      if (selectedCell) {
        updateSelectedCell(
          getValidNewCellPosition(
            selectedCell,
            {
              ...selectedCell,
              row: selectedCell.row + 1,
            },
            props.puzzleDefinition,
          ),
        );
      }
    },
    [selectedCell, updateSelectedCell, props.puzzleDefinition],
  );
  useKeypress(
    "ArrowLeft",
    () => {
      if (selectedCell) {
        updateSelectedCell(
          getValidNewCellPosition(
            selectedCell,
            {
              ...selectedCell,
              column: selectedCell.column - 1,
            },
            props.puzzleDefinition,
          ),
        );
      }
    },
    [selectedCell, updateSelectedCell, props.puzzleDefinition],
  );
  useKeypress(
    "ArrowRight",
    () => {
      if (selectedCell) {
        updateSelectedCell(
          getValidNewCellPosition(
            selectedCell,
            {
              ...selectedCell,
              column: selectedCell.column + 1,
            },
            props.puzzleDefinition,
          ),
        );
      }
    },
    [selectedCell, updateSelectedCell, props.puzzleDefinition],
  );
  return (
    <div className="puzzle-view">
      <PuzzleGrid
        puzzleState={puzzleState}
        puzzleWidth={props.puzzleDefinition.width}
        selectedCell={selectedCell}
        onSelectCell={updateSelectedCell}
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
      <PuzzleHints selectedCell={selectedCell} puzzleDefinition={props.puzzleDefinition} />
    </div>
  );
};
