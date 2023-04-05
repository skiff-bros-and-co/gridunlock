import classnames from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CellDefinition, CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import { PlayerState, PuzzleGameCell, PuzzleState } from "../state/State";
import { applyArrayChanges } from "../utils/applyArrayChanges";
import { generateCellWordPositions } from "../utils/generateCellWordPositions";
import { getNextCell, getNextUnfilledCell } from "../utils/getNextCell";
import { isPuzzleComplete } from "../utils/isPuzzleComplete";
import { validatePuzzleState } from "../utils/validatePuzzleState";
import { RoomSyncService, getSyncedCellKey } from "../web-rtc/RoomSyncService";
import { SyncedPlayerState, SyncedPuzzleCellState, SyncedPuzzleState } from "../web-rtc/types";
import { Header } from "./Header";
import { useEventCallback, useKeypress } from "./Hooks";
import { PuzzleGrid } from "./PuzzleGrid";
import { useSyncedMap } from "./SyncingHooks";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { NarrowScreenClues } from "./clues/NarrowScreenClues";
import { PuzzleClues } from "./clues/PuzzleClues";

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
    wrapToNextClue: true,
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

const mapSyncState = (state: SyncedPuzzleState, puzzle: PuzzleDefinition) => {
  const result: PuzzleState = [];
  for (let row = 0; row < puzzle.height; row++) {
    const resultRow: PuzzleGameCell[] = [];
    for (let column = 0; column < puzzle.width; column++) {
      const syncedCell = state[getSyncedCellKey({ row, column })];
      const cellDef = puzzle.cells[row][column];
      resultRow.push({
        filledValue: syncedCell.value,
        isMarkedIncorrect: syncedCell.isMarkedIncorrect,
        isBlocked: cellDef.isBlocked,
        clueNumber: cellDef.clueNumber,
      });
    }

    result.push(resultRow);
  }

  return result;
};

export const PuzzleView = (props: Props): JSX.Element => {
  const { puzzle, syncService } = props;

  const [syncedPuzzleCells, { set: setSyncedCell }] = useSyncedMap<SyncedPuzzleCellState>(
    syncService.syncedPuzzleState,
  );

  const [playersState, setPlayersState] = useState<PlayerState[]>([]);
  const [localState, setLocalState] = useState<LocalState>(() => ({
    fillDirection: "across",
    selectedPosition: getInitPosition(puzzle),
    puzzleState: initializePuzzleState(puzzle),
    isPuzzleWon: false,
  }));

  useEffect(() => {
    setLocalState((prev) => {
      // TODO: There are better ways....

      return {
        ...prev,
        puzzleState: applyArrayChanges(prev.puzzleState, mapSyncState(syncedPuzzleCells, puzzle)),
      };
    });
  }, [puzzle, syncedPuzzleCells]);

  const moveToNextCell = useCallback(
    (direction: "forward" | "backward" | "up" | "down" | "left" | "right") => {
      setLocalState((prev) => {
        if (direction === "forward") {
          return {
            ...prev,
            selectedPosition: getNextUnfilledCell(prev.puzzleState, {
              direction: prev.fillDirection,
              position: prev.selectedPosition,
              puzzle,
              wrapToNextClue: true,
            }),
          };
        }

        return {
          ...prev,
          selectedPosition: getNextCell({
            direction:
              direction === "backward"
                ? prev.fillDirection
                : direction === "up" || direction === "down"
                ? "down"
                : "across",
            position: prev.selectedPosition,
            puzzle,
            backwards: direction === "backward" || direction === "up" || direction === "left",
            wrapToNextClue: direction === "backward",
          }),
        };
      });
    },
    [puzzle],
  );
  const jumpToClue = useCallback(
    (clueNumber: number) => {
      setLocalState((prev) => ({
        ...prev,
        selectedPosition: puzzle.clues[prev.fillDirection][clueNumber].position,
      }));
    },
    [puzzle],
  );

  const updateCellValue = useEventCallback(
    (newValue: string) => {
      setSyncedCell(getSyncedCellKey(localState.selectedPosition), { value: newValue, isMarkedIncorrect: false });
    },
    [localState.selectedPosition],
  );
  const handleBackspace = useCallback(() => {
    updateCellValue("");
    moveToNextCell("backward");
  }, [moveToNextCell, updateCellValue]);

  const togglefillDirection = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      fillDirection: prev.fillDirection === "across" ? "down" : "across",
    }));
  }, []);

  const handleNewPlayersState = useCallback(
    (state: SyncedPlayerState[]) => {
      setPlayersState((prev) =>
        applyArrayChanges(
          prev,
          state.map((player, index) => ({
            index: index,
            name: player.info.name,
            position: player.position,
            isLocalPlayer: player.info.clientID === syncService.clientID,
          })),
        ),
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
        handleBackspace();
      }
      if (key === "Tab") {
        moveToNextCell("forward");
      }
    },
    [moveToNextCell, togglefillDirection, handleBackspace],
  );

  const cellWordPositions = useMemo(() => generateCellWordPositions(puzzle), [puzzle]);

  const handleSelectCell = useCallback((newSelectedCell: CellPosition) => {
    setLocalState((prev) => ({
      ...prev,
      selectedPosition: newSelectedCell,
    }));
  }, []);

  const handleCellValueInput = useCallback(
    (newValue) => {
      const input = getValidInput(newValue);
      if (input) {
        updateCellValue(input);
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
      <NarrowScreenClues
        fillDirection={localState.fillDirection}
        puzzle={props.puzzle}
        selectedCell={localState.selectedPosition}
        onSelectClue={jumpToClue}
        onToggleFillDirection={togglefillDirection}
      />
      <VirtualKeyboard onKeyboardInput={handleCellValueInput} onBackspace={handleBackspace} />
    </div>
  );
};
