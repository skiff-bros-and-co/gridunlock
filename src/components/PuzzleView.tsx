import update from "immutability-helper";
import { useCallback, useEffect, useState } from "react";
import { Cell, CellPosition, PuzzleDefinition, PuzzleDirection, SingleLetter } from "../state/Puzzle";
import { PuzzleGameCell, PuzzleState } from "../state/State";
import { RoomSyncService } from "../web-rtc/RoomSyncService";
import { SyncedPuzzleState } from "../web-rtc/types";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { useKeypress } from "./Hooks";
import { PuzzleGrid } from "./PuzzleGrid";
import { PuzzleHints } from "./PuzzleHints";

interface Props {
  puzzleDefinition: PuzzleDefinition;
  syncService: RoomSyncService;
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

  const inputCharacter = input.slice(-1);

  if (inputCharacter.match(alphaCharacterRegex)) {
    return inputCharacter.toUpperCase() as SingleLetter;
  }

  return null;
};

export const PuzzleView = (props: Props): JSX.Element => {
  const [puzzleState, updatePuzzleState] = useState(initializePuzzleState(props.puzzleDefinition));
  const [selectedCell, updateSelectedCell] = useState<CellPosition | null>(null);
  const [entryDirection, updateEntryDirection] = useState<PuzzleDirection | null>("across");
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

      props.syncService.changeCell({
        position,
        value: {
          value: newValue,
        },
      });
      updatePuzzleState(newPuzzleState);
    },
    [updatePuzzleState, puzzleState, props.syncService],
  );
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
  const moveToPreviousCell = useCallback(() => {
    if (selectedCell && entryDirection === "across") {
      moveSelectedCell({
        column: selectedCell.column - 1,
      });
    }
    if (selectedCell && entryDirection === "down") {
      moveSelectedCell({
        row: selectedCell.row - 1,
      });
    }
  }, [moveSelectedCell, entryDirection]);
  const toggleEntryDirection = useCallback(() => {
    if (entryDirection === "across") {
      updateEntryDirection("down");
    } else {
      updateEntryDirection("across");
    }
  }, [entryDirection, updateEntryDirection]);

  const handleNewCells = useCallback(
    (data: SyncedPuzzleState) => {
      updatePuzzleState((oldState) =>
        oldState.map((row, rowIndex) =>
          row.map((cell, colIndex) => ({
            ...cell,
            filledValue: (data.cells[rowIndex][colIndex].value ?? "") as SingleLetter,
          })),
        ),
      );
    },
    [updatePuzzleState],
  );

  useEffect(() => {
    props.syncService.addEventListener("cellsChanged", handleNewCells);

    return () => props.syncService.removeEventListener("cellsChanged", handleNewCells);
  }, [props.syncService, handleNewCells]);

  useKeypress(
    (key) => {
      if (!selectedCell) {
        return;
      }
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
      if (key === "Enter") {
        toggleEntryDirection();
      }
      if (key === "Backspace") {
        if (puzzleState[selectedCell.row][selectedCell.column].filledValue !== "") {
          updateCellValue("", selectedCell);
        } else {
          moveToPreviousCell();
        }
      }
      if (key === "Tab") {
        moveToNextCell();
      }
    },
    [selectedCell, updateSelectedCell, props.puzzleDefinition, updatePuzzleState, puzzleState, toggleEntryDirection],
  );

  return (
    <div className="puzzle-view">
      <Header />
      <PuzzleGrid
        puzzleState={puzzleState}
        puzzleDefinition={props.puzzleDefinition}
        puzzleWidth={props.puzzleDefinition.width}
        entryDirection={entryDirection}
        selectedCell={selectedCell}
        onSelectCell={(newSelectedCell) => {
          console.log("onSelectCell", selectedCell, newSelectedCell);
          if (
            selectedCell &&
            newSelectedCell &&
            newSelectedCell.row === selectedCell.row &&
            newSelectedCell.column === selectedCell.column
          ) {
            toggleEntryDirection();
          } else {
            updateSelectedCell(newSelectedCell);
          }
        }}
        onCellValueInput={(position: CellPosition, newValue: string) => {
          const input = getValidInput(newValue);
          if (input) {
            updateCellValue(input, position);
            moveToNextCell();
          }
        }}
      />
      <PuzzleHints selectedCell={selectedCell} puzzleDefinition={props.puzzleDefinition} />
      <Footer />
    </div>
  );
};
