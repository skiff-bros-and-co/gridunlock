import { useState } from "react";
import { Cell, CellPosition, PuzzleDefinition, PuzzleDirection } from "../state/Puzzle";
import { PuzzleGameCell, PuzzleState } from "../state/State";
import { PuzzleGrid } from "./PuzzleGrid";
import update from "immutability-helper";
import { PuzzleHints } from "./PuzzleHints";
import { useKeypress } from "./Hooks";
import { useCallback } from "react";

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

const isCellPositionValid = (
  newCell: Partial<CellPosition>,
  puzzleDefinition: PuzzleDefinition,
): newCell is CellPosition => {
  return Boolean(
    newCell.column !== undefined &&
      newCell.column < puzzleDefinition.width &&
      newCell.column >= 0 &&
      newCell.row !== undefined &&
      newCell.row < puzzleDefinition.height &&
      newCell.row >= 0 &&
      !puzzleDefinition.cells[newCell.row][newCell.column].isBlocked,
  );
};

export const PuzzleView = (props: Props): JSX.Element => {
  const [puzzleState, updatePuzzleState] = useState(initializePuzzleState(props.puzzleDefinition));
  const [selectedCell, updateSelectedCell] = useState<CellPosition | null>(null);
  const moveSelectedCell = useCallback(
    (cellPosition: Partial<CellPosition>) => {
      const newSelectedCell = {
        ...selectedCell,
        ...cellPosition,
      };
      if (isCellPositionValid(newSelectedCell, props.puzzleDefinition)) {
        updateSelectedCell(newSelectedCell);
      }
    },
    [selectedCell, props.puzzleDefinition],
  );

  const [entryDirection] = useState<PuzzleDirection | null>("across");

  useKeypress(
    (key) => {
      if (selectedCell) {
        if (key === "ArrowDown") {
          moveSelectedCell({
            row: selectedCell.row + 1,
          });
        }
        if (key === "ArrowUp") {
          moveSelectedCell({
            row: selectedCell.row - 1,
          });
        }
        if (key === "ArrowLeft") {
          moveSelectedCell({
            column: selectedCell.column - 1,
          });
        }
        if (key === "ArrowRight") {
          moveSelectedCell({
            column: selectedCell.column + 1,
          });
        }
        if (key === "Backspace" && selectedCell) {
          const newPuzzleState = update(puzzleState, {
            [selectedCell.row]: {
              [selectedCell.column]: {
                filledValue: {
                  // TODO: set author here
                  $set: "",
                },
              },
            },
          });
          updatePuzzleState(newPuzzleState);
        }
      }
    },
    [selectedCell, updateSelectedCell, props.puzzleDefinition, updatePuzzleState, puzzleState],
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
          if (selectedCell && entryDirection === "across") {
            moveSelectedCell({
              column: selectedCell.column + 1,
            });
          }
          if (selectedCell && entryDirection === "down") {
            moveSelectedCell({
              row: selectedCell.row + 1,
            });
          }
        }}
      />
      <PuzzleHints selectedCell={selectedCell} puzzleDefinition={props.puzzleDefinition} />
    </div>
  );
};
