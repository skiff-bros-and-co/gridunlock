import classnames from "classnames";
import update from "immutability-helper";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CellDefinition, CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import { PlayerState, PuzzleGameCell, PuzzleState } from "../state/State";
import { generateCellWordPositions } from "../utils/generateCellWordPositions";
import { getNextCell } from "../utils/getNextCell";
import { isPuzzleComplete } from "../utils/isPuzzleComplete";
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

interface LocalState {
  selectedPosition: CellPosition | undefined;
  fillDirection: FillDirection;
  puzzleState: PuzzleState;
  isPuzzleWon: boolean;
}

const initializeEmptyCell = (cell: CellDefinition): PuzzleGameCell => ({
  filledValue: "",
  isBlocked: cell.isBlocked,
  clueNumber: cell.clueNumber,
});

const initializePuzzleState = (puzzle: PuzzleDefinition): PuzzleState => {
  return puzzle.cells.map((row: CellDefinition[]) => row.map((cell) => initializeEmptyCell(cell)));
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

  const [playersState, setPlayersState] = useState<PlayerState[]>([]);
  const [localState, setLocalState] = useState<LocalState>(() => ({
    fillDirection: "across",
    selectedPosition: undefined,
    puzzleState: initializePuzzleState(puzzle),
    isPuzzleWon: false,
  }));

  const moveToNextCell = useCallback(
    (direction: "forward" | "backward" | "up" | "down" | "left" | "right") => {
      setLocalState((prev) => {
        const prevPosition: CellPosition =
          prev.selectedPosition == null ? { column: 0, row: 0 } : prev.selectedPosition;
        const isUsingPrevDirection = direction === "forward" || direction === "backward";

        return {
          ...prev,
          selectedPosition: getNextCell({
            direction: isUsingPrevDirection
              ? prev.fillDirection
              : direction === "up" || direction === "down"
              ? "down"
              : "across",
            position: prevPosition,
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
        position ??= prev.selectedPosition;
        const newPuzzleState = update(prev.puzzleState, {
          [position!.row]: {
            [position!.column]: {
              filledValue: {
                // TODO: set author here
                $set: newValue,
              },
            },
          },
        });

        syncService.changeCell({
          position: position!,
          value: {
            value: newValue,
          },
        });

        return {
          ...prev,
          puzzleState: newPuzzleState,
        };
      });
    },
    [setLocalState, syncService],
  );

  const togglefillDirection = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      fillDirection: prev.fillDirection === "across" ? "down" : "across",
    }));
  }, [setLocalState]);

  const handleNewSync = useCallback(
    (data: SyncedPuzzleState) => {
      setLocalState(
        (prev) =>
          update(prev, {
            puzzleState: prev.puzzleState.map((row, rowIndex) =>
              row.map((_cell, colIndex) => ({
                filledValue: {
                  $set: data.cells[rowIndex][colIndex].value ?? "",
                },
              })),
            ),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any), // TODO: fix types
      );
    },
    [setLocalState],
  );
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
        })),
      );
    },
    [setPlayersState],
  );
  useEffect(() => {
    syncService.updatePlayerPosition(localState.selectedPosition);
  }, [syncService, localState.selectedPosition]);
  useEffect(() => {
    syncService.addEventListener("playersStateChanged", handleNewPlayersState);
    return () => syncService.removeEventListener("playersStateChanged", handleNewPlayersState);
  }, [syncService, handleNewPlayersState]);
  useEffect(() => {
    if (isPuzzleComplete(localState.puzzleState, puzzle)) {
      setLocalState((prev) => ({
        ...prev,
        isPuzzleWon: true,
      }));
    }
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

  const handleSelectCell = useCallback(
    (newSelectedCell: CellPosition | undefined) => {
      setLocalState((prev) => ({
        ...prev,
        selectedPosition: newSelectedCell,
      }));
    },
    [setLocalState],
  );

  const handleCellValueInput = useCallback(
    (position: CellPosition, newValue: string) => {
      if (localState.isPuzzleWon) {
        return;
      }

      const input = getValidInput(newValue);
      if (input) {
        updateCellValue(input, position);
        moveToNextCell("forward");
      }
    },
    [updateCellValue, moveToNextCell, localState.isPuzzleWon],
  );

  return (
    <div className={classnames("puzzle-view", { "-puzzle-won": localState.isPuzzleWon })}>
      <Header />
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
      <PuzzleClues selectedCell={localState.selectedPosition} puzzle={puzzle} />
      <Footer />
    </div>
  );
};
