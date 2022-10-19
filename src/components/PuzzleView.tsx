import update from "immutability-helper";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CellDefinition, CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import { PlayerState, PuzzleGameCell, PuzzleState } from "../state/State";
import { generateCellWordPositions } from "../utils/generateCellWordPositions";
import { getNextCell } from "../utils/getNextCell";
import { RoomSyncService } from "../web-rtc/RoomSyncService";
import { SyncedPlayerState, SyncedPuzzleState } from "../web-rtc/types";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { useKeypress } from "./Hooks";
import { PuzzleClues } from "./PuzzleClues";
import { PuzzleGrid } from "./PuzzleGrid";

interface Props {
  puzzle: PuzzleDefinition;
  syncService: RoomSyncService;
}

const initializeEmptyCell = (cell: CellDefinition): PuzzleGameCell => ({
  filledValue: "",
  isBlocked: cell.isBlocked,
  clueNumber: cell.clueNumber,
});

const initializePuzzleState = (puzzle: PuzzleDefinition): PuzzleState => {
  return puzzle.cells.map((row: CellDefinition[]) => row.map((cell) => initializeEmptyCell(cell)));
};

const isCellPositionValid = (newCell: Partial<CellPosition>, puzzle: PuzzleDefinition): newCell is CellPosition => {
  return Boolean(
    newCell.column !== undefined &&
      newCell.column < puzzle.width &&
      newCell.column >= 0 &&
      newCell.row !== undefined &&
      newCell.row < puzzle.height &&
      newCell.row >= 0 &&
      !puzzle.cells[newCell.row][newCell.column].isBlocked,
  );
};

const alphaCharacterRegex = /^[A-Za-z]$/;

const getValidInput = (input: string): string | null => {
  if (input.length === 0) {
    return "";
  }

  const inputCharacter = input.slice(-1);

  if (inputCharacter.match(alphaCharacterRegex)) {
    return inputCharacter.toUpperCase();
  }

  return null;
};

export const PuzzleView = (props: Props): JSX.Element => {
  const { puzzle, syncService } = props;

  const [puzzleState, updatePuzzleState] = useState(() => initializePuzzleState(puzzle));
  const [selectedCell, updateSelectedCell] = useState<CellPosition | null>(null);
  const [fillDirection, updatefillDirection] = useState<FillDirection>("across");
  const [playersState, setPlayersState] = useState<PlayerState[]>([]);

  const moveSelectedCell = useCallback(
    (cellPosition: Partial<CellPosition>) => {
      const newSelectedCell = {
        ...selectedCell,
        ...cellPosition,
      };
      if (isCellPositionValid(newSelectedCell, puzzle)) {
        updateSelectedCell(newSelectedCell);
      }
    },
    [selectedCell, puzzle],
  );
  const updateCellValue = useCallback(
    (newValue: string, position: CellPosition) => {
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

      syncService.changeCell({
        position,
        value: {
          value: newValue,
        },
      });
      updatePuzzleState(newPuzzleState);
    },
    [updatePuzzleState, puzzleState, syncService],
  );
  const moveToNextCell = useCallback(() => {
    if (selectedCell == null) {
      console.error("attempted to move to next cell with no cell selected");
      return;
    }
    moveSelectedCell(
      getNextCell({
        position: selectedCell,
        direction: fillDirection,
        puzzle,
      }),
    );
  }, [moveSelectedCell, selectedCell, fillDirection, puzzle]);
  const moveToPreviousCell = useCallback(() => {
    if (selectedCell == null) {
      console.error("attempted to move to next cell with no cell selected");
      return;
    }
    moveSelectedCell(
      getNextCell({
        position: selectedCell,
        direction: fillDirection,
        puzzle,
        backwards: true,
      }),
    );
  }, [selectedCell, moveSelectedCell, fillDirection, puzzle]);
  const togglefillDirection = useCallback(() => {
    if (fillDirection === "across") {
      updatefillDirection("down");
    } else {
      updatefillDirection("across");
    }
  }, [fillDirection, updatefillDirection]);

  const handleNewCells = useCallback(
    (data: SyncedPuzzleState) => {
      updatePuzzleState((oldState) =>
        oldState.map((row, rowIndex) =>
          row.map((cell, colIndex) => ({
            ...cell,
            filledValue: data.cells[rowIndex][colIndex].value ?? "",
          })),
        ),
      );
    },
    [updatePuzzleState],
  );
  useEffect(() => {
    syncService.addEventListener("cellsChanged", handleNewCells);
    return () => syncService.removeEventListener("cellsChanged", handleNewCells);
  }, [syncService, handleNewCells]);

  const handleNewPlayersState = useCallback(
    (state: SyncedPlayerState[]) => {
      setPlayersState(
        state.map((player, index) => ({
          index: index,
          name: player.info.name,
          position: player.position,
        })),
      );
    },
    [setPlayersState],
  );
  useEffect(() => {
    syncService.updatePlayerPosition(selectedCell ?? undefined);
  }, [syncService, selectedCell]);
  useEffect(() => {
    syncService.addEventListener("playersStateChanged", handleNewPlayersState);
    return () => syncService.removeEventListener("playersStateChanged", handleNewPlayersState);
  }, [syncService, handleNewPlayersState]);

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
        togglefillDirection();
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
    [selectedCell, updateSelectedCell, puzzle, updatePuzzleState, puzzleState, togglefillDirection],
  );

  const cellWordPositions = useMemo(() => generateCellWordPositions(puzzle), [puzzle]);

  const handleSelectCell = useCallback(
    (newSelectedCell: CellPosition | null) => {
      console.log("onSelectCell", selectedCell, newSelectedCell);
      if (
        selectedCell &&
        newSelectedCell &&
        newSelectedCell.row === selectedCell.row &&
        newSelectedCell.column === selectedCell.column
      ) {
        togglefillDirection();
      } else {
        updateSelectedCell(newSelectedCell);
      }
    },
    [selectedCell, togglefillDirection, updateSelectedCell],
  );

  const handleCellValueInput = useCallback(
    (position: CellPosition, newValue: string) => {
      const input = getValidInput(newValue);
      if (input) {
        updateCellValue(input, position);
        moveToNextCell();
      }
    },
    [updateCellValue, moveToNextCell],
  );

  return (
    <div className="puzzle-view">
      <Header />
      <PuzzleGrid
        puzzleState={puzzleState}
        puzzle={puzzle}
        fillDirection={fillDirection}
        selectedCell={selectedCell}
        playersState={playersState}
        cellWordPositions={cellWordPositions}
        onSelectCell={handleSelectCell}
        onCellValueInput={handleCellValueInput}
      />
      <PuzzleClues selectedCell={selectedCell} puzzle={puzzle} />
      <Footer />
    </div>
  );
};
