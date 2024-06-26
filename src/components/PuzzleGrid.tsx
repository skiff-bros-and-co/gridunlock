import { useEffect } from "react";
import type { CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import type { PlayerState, PuzzleState } from "../state/State";
import type { CellWordPositions } from "../utils/generateCellWordPositions";
import { getColorForPlayer } from "../utils/getColorForPlayerIndex";
import { PuzzleCell } from "./PuzzleCell";

interface Props {
  puzzle: PuzzleDefinition;
  puzzleState: PuzzleState;
  fillDirection: FillDirection;
  selectedCell: CellPosition;
  playersState: PlayerState[];
  cellWordPositions: CellWordPositions;
  onSelectCell: (position: CellPosition) => void;
  onToggleFillDirection: () => void;
  onCellValueInput: (value: string) => void;
}

const setColumnCount = (columnCount: number) => {
  document.documentElement.style.setProperty("--puzzle-column-count", `${columnCount}`);
};

const isSelectedCell = (rowIndex: number, colIndex: number, selectedCell: CellPosition | undefined): boolean =>
  Boolean(selectedCell && selectedCell.column === colIndex && selectedCell.row === rowIndex);

const isInSelectedWord = (
  cellToCheck: CellPosition,
  selectedCell: CellPosition,
  puzzle: PuzzleDefinition,
  fillDirection: FillDirection,
): boolean => {
  const selectedClueInfo = puzzle.clues.byRowAndColumn[selectedCell.row][selectedCell.column];
  const checkClueInfo = puzzle.clues.byRowAndColumn[cellToCheck.row][cellToCheck.column];

  if (!selectedClueInfo || !checkClueInfo) {
    return false;
  }

  if (fillDirection === "across") {
    return checkClueInfo.acrossClueNumber === selectedClueInfo.acrossClueNumber;
  }

  return checkClueInfo.downClueNumber === selectedClueInfo.downClueNumber;
};

function getSelectedCellColor(row: number, column: number, playersState: PlayerState[]) {
  const playersOnCell = playersState.filter((p) => p.position?.row === row && p.position?.column === column);
  const playerToShow = playersOnCell.find((p) => p.isLocalPlayer) ?? playersOnCell[0];

  return getColorForPlayer(playerToShow);
}

export const PuzzleGrid = (props: Props): JSX.Element => {
  const {
    puzzleState,
    puzzle,
    selectedCell,
    fillDirection,
    cellWordPositions,
    playersState,
    onCellValueInput,
    onSelectCell,
    onToggleFillDirection,
  } = props;
  useEffect(() => setColumnCount(puzzle.width), [puzzle.width]);

  const cells: JSX.Element[] = puzzleState.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const inSelectedWord = isInSelectedWord(
        {
          row: rowIndex,
          column: colIndex,
        },
        selectedCell,
        puzzle,
        fillDirection,
      );

      return (
        <PuzzleCell
          key={`${rowIndex}-${
            // biome-ignore lint/suspicious/noArrayIndexKey: This is a static sized board
            colIndex
          }`}
          isSelected={isSelectedCell(rowIndex, colIndex, selectedCell)}
          isInSelectedWord={inSelectedWord}
          row={rowIndex}
          column={colIndex}
          wordPosition={cellWordPositions[rowIndex][colIndex]}
          fillDirection={inSelectedWord ? fillDirection : null}
          selectedColor={getSelectedCellColor(rowIndex, colIndex, playersState)}
          gameCell={cell}
          onToggleFillDirection={onToggleFillDirection}
          onSelectCell={onSelectCell}
          onCellValueInput={onCellValueInput}
        />
      );
    }),
  );

  return (
    <div className="puzzle-container">
      <h3 className="puzzle-title">{puzzle.title}</h3>
      <h5 className="puzzle-author">{puzzle.author}</h5>
      <div className="grid-container">{cells}</div>
      <div className="puzzle-copyright">© {puzzle.copyright}</div>
    </div>
  );
};
