import classnames from "classnames";
import update from "immutability-helper";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CellDefinition, CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import { PlayerState, PuzzleGameCell, PuzzleState } from "../state/State";
import { generateCellWordPositions } from "../utils/generateCellWordPositions";
import { getNextCell } from "../utils/getNextCell";
import { isPuzzleComplete } from "../utils/isPuzzleComplete";
import { validatePuzzleState } from "../utils/validatePuzzleState";
import { RoomSyncService } from "../web-rtc/RoomSyncService";
import { SyncedPlayerState, SyncedPuzzleState } from "../web-rtc/types";
import { Header } from "./Header";
import { useKeypress } from "./Hooks";
import { PuzzleClues } from "./PuzzleClues";
import { PuzzleGrid } from "./PuzzleGrid";
import { VirtualKeyboard } from "./VirtualKeyboard";

interface Props {
  puzzle: PuzzleDefinition;
  syncService: RoomSyncService;
}

interface LocalState {
  selectedPosition: CellPosition;
  fillDirection: FillDirection;
  puzzleState: PuzzleState;
  isPuzzleWon: boolean;
}

const initializeEmptyCell = (cell: CellDefinition): PuzzleGameCell => ({
  filledValue: "",
  isBlocked: cell.isBlocked,
  clueNumber: cell.clueNumber,
  isMarkedIncorrect: false,
});

const initializePuzzleState = (puzzle: PuzzleDefinition): PuzzleState => {
  return puzzle.cells.map((row: CellDefinition[]) => row.map((cell) => initializeEmptyCell(cell)));
};

function getInitPosition(puzzle: PuzzleDefinition): CellPosition {
  const origin: CellPosition = { row: 0, column: 0 };
  if (!puzzle.cells[0][0].isBlocked) {
    return origin;
  }

  return getNextCell({
    puzzle,
    position: origin,
    direction: "across",
  });
}

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

  const [playersState, setPlayersState] = useState<PlayerState[]>([]);
  const [localState, setLocalState] = useState<LocalState>(() => ({
    fillDirection: "across",
    selectedPosition: getInitPosition(puzzle),
    puzzleState: initializePuzzleState(puzzle),
    isPuzzleWon: false,
  }));

  const moveToNextCell = useCallback(
    (direction: "forward" | "backward" | "up" | "down" | "left" | "right") => {
      setLocalState((prev) => {
        const isUsingPrevDirection = direction === "forward" || direction === "backward";

        return {
          ...prev,
          selectedPosition: getNextCell({
            direction: isUsingPrevDirection
              ? prev.fillDirection
              : direction === "up" || direction === "down"
              ? "down"
              : "across",
            position: prev.selectedPosition,
            puzzle,
            backwards: direction === "backward" || direction === "up" || direction === "left",
          }),
        };
      });
    },
    [puzzle],
  );

  const updateCellValue = useCallback(
    (newValue: string, position?: CellPosition) => {
      setLocalState((prev) => {
        if (prev.isPuzzleWon) {
          return prev;
        }

        position ??= prev.selectedPosition;
        syncService.changeCell({
          position: position!,
          value: {
            value: newValue,
            isMarkedIncorrect: false,
          },
        });

        return prev;
      });
    },
    [syncService],
  );

  const togglefillDirection = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      fillDirection: prev.fillDirection === "across" ? "down" : "across",
    }));
  }, []);

  const handleNewSync = useCallback((data: SyncedPuzzleState) => {
    setLocalState(
      (prev) =>
        update(prev, {
          puzzleState: prev.puzzleState.map((row, rowIndex) =>
            row.map((_cell, colIndex) => ({
              filledValue: {
                $set: data.cells[rowIndex][colIndex].value ?? "",
              },
              isMarkedIncorrect: {
                $set: data.cells[rowIndex][colIndex].isMarkedIncorrect,
              },
            })),
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any), // TODO: fix types
    );
  }, []);
  useEffect(() => {
    syncService.addEventListener("cellsChanged", handleNewSync);
    return () => syncService.removeEventListener("cellsChanged", handleNewSync);
  }, [syncService, handleNewSync]);

  const handleNewPlayersState = useCallback(
    (state: SyncedPlayerState[]) => {
      setPlayersState(
        state.map((player, index) => ({
          index: index,
          name: player.info.name,
          position: player.position,
          isLocalPlayer: player.info.clientID === syncService.clientID,
        })),
      );
    },
    [syncService.clientID],
  );
  useEffect(() => {
    syncService.updatePlayerPosition(localState.selectedPosition);
  }, [syncService, localState.selectedPosition]);
  useEffect(() => {
    syncService.addEventListener("playersStateChanged", handleNewPlayersState);
    return () => syncService.removeEventListener("playersStateChanged", handleNewPlayersState);
  }, [syncService, handleNewPlayersState]);
  useEffect(() => {
    setLocalState((prev) => ({
      ...prev,
      isPuzzleWon: isPuzzleComplete(localState.puzzleState, puzzle),
    }));
  }, [localState.puzzleState, puzzle]);

  useKeypress(
    (key) => {
      if (key === "ArrowDown") {
        moveToNextCell("down");
      }
      if (key === "ArrowUp") {
        moveToNextCell("up");
      }
      if (key === "ArrowLeft") {
        moveToNextCell("left");
      }
      if (key === "ArrowRight") {
        moveToNextCell("right");
      }
      if (key === "Enter") {
        togglefillDirection();
      }
      if (key === "Backspace") {
        updateCellValue("");
        moveToNextCell("backward");
      }
      if (key === "Tab") {
        moveToNextCell("forward");
      }
    },
    [moveToNextCell, togglefillDirection],
  );

  const cellWordPositions = useMemo(() => generateCellWordPositions(puzzle), [puzzle]);

  const handleSelectCell = useCallback((newSelectedCell: CellPosition) => {
    setLocalState((prev) => ({
      ...prev,
      selectedPosition: newSelectedCell,
    }));
  }, []);

  const handleCellValueInput = useCallback(
    (position: CellPosition, newValue: string) => {
      const input = getValidInput(newValue);
      if (input) {
        updateCellValue(input, position);
        moveToNextCell("forward");
      }
    },
    [updateCellValue, moveToNextCell],
  );

  const handleCheckPuzzle = useCallback(() => {
    setLocalState((prev) => {
      syncService.markInvalidCells(validatePuzzleState(prev.puzzleState, puzzle));
      return prev;
    });
  }, [puzzle, syncService]);

  return (
    <div className={classnames("puzzle-view", { "-puzzle-won": localState.isPuzzleWon })}>
      <Header onCheckPuzzle={handleCheckPuzzle} />
      <PuzzleGrid
        puzzleState={localState.puzzleState}
        puzzle={puzzle}
        fillDirection={localState.fillDirection}
        selectedCell={localState.selectedPosition}
        playersState={playersState}
        cellWordPositions={cellWordPositions}
        onSelectCell={handleSelectCell}
        onToggleFillDirection={togglefillDirection}
        onCellValueInput={handleCellValueInput}
      />
      <PuzzleClues
        selectedCell={localState.selectedPosition}
        fillDirection={localState.fillDirection}
        puzzle={puzzle}
      />
      <VirtualKeyboard onChange={handleCellValueInput} />
    </div>
  );
};
