import { useEffect } from "react";
import { CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import type { PlayerState, PuzzleState } from "../state/State";
import { CellWordPositions } from "../utils/generateCellWordPositions";
import { getColorForPlayer } from "../utils/getColorForPlayerIndex";
import { PuzzleCell } from "./PuzzleCell";

interface Props {
  puzzle: PuzzleDefinition;
  puzzleState: PuzzleState;
  fillDirection: FillDirection;
  selectedCell: CellPosition | undefined;
  playersState: PlayerState[];
  cellWordPositions: CellWordPositions;
  onSelectCell: (position: CellPosition | undefined) => void;
  onCellValueInput: (position: CellPosition, value: string) => void;
}

const setColumnCount = (columnCount: number) => {
  document.documentElement.style.setProperty("--grid-column-count", `${columnCount}`);
};

const isSelectedCell = (rowIndex: number, colIndex: number, selectedCell: CellPosition | undefined): boolean =>
  Boolean(selectedCell && selectedCell.column === colIndex && selectedCell.row === rowIndex);

const isInSelectedWord = (
  cellToCheck: CellPosition,
  selectedCell: CellPosition | undefined,
  puzzle: PuzzleDefinition,
  fillDirection: FillDirection,
): boolean => {
  if (!selectedCell) {
    return false;
  }

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
  const player = playersState.filter((p) => p.position?.row === row && p.position?.column === column)[0];

  return getColorForPlayer(player);
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
  } = props;
  useEffect(() => setColumnCount(puzzle.width), [puzzle.width]);

  const cells: JSX.Element[] = puzzleState.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const selectedCellColor = getSelectedCellColor(rowIndex, colIndex, playersState);

      return (
        <PuzzleCell
          key={`${rowIndex}-${colIndex}`}
          isSelected={isSelectedCell(rowIndex, colIndex, selectedCell)}
          isInSelectedWord={isInSelectedWord(
            {
              row: rowIndex,
              column: colIndex,
            },
            selectedCell,
            puzzle,
            fillDirection,
          )}
          row={rowIndex}
          column={colIndex}
          wordPosition={cellWordPositions[rowIndex][colIndex]}
          fillDirection={selectedCellColor == null ? null : fillDirection}
          selectedColor={selectedCellColor}
          gameCell={cell}
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
