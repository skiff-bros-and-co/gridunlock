import { useState } from "react";
import { Cell, CellPosition, PuzzleDefinition, PuzzleDirection, SingleLetter } from "../state/Puzzle";
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

const alphaCharacterRegex = /^[A-Za-z]$/;

const getValidInput = (input: string): SingleLetter | "" | null => {
  if (input.length === 0) {
    return "";
  }

  if (input.length === 1 && input[0].match(alphaCharacterRegex)) {
    return input[0].toUpperCase() as SingleLetter;
  }

  return null;
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
  const updateCellValue = useCallback(
    (newValue: SingleLetter | "", position: CellPosition) => {
      const newPuzzleState = update(puzzleState, {
        [position.row]: {
          [position.column]: {
            filledValue: {
              // TODO: set author here
              $set: newValue,
            },
          },
        },
      });
      updatePuzzleState(newPuzzleState);
    },
    [updatePuzzleState, puzzleState],
  );
  const [entryDirection] = useState<PuzzleDirection | null>("across");
  const moveToNextCell = useCallback(() => {
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
  }, [moveSelectedCell, entryDirection]);

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
          updateCellValue("", selectedCell);
        }
        if (key === "Tab") {
          moveToNextCell();
        }
        if (key.match(alphaCharacterRegex) && selectedCell) {
          const input = getValidInput(key);
          if (input) {
            updateCellValue(input, selectedCell);
            moveToNextCell();
          }
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
      />
      <PuzzleHints selectedCell={selectedCell} puzzleDefinition={props.puzzleDefinition} />
    </div>
  );
};
