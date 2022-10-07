import { useEffect } from "react";
import type { PuzzleState } from "../state/State";
import { PuzzleCell } from "./PuzzleCell";
import { CellPosition, PuzzleDefinition, PuzzleDirection } from "../state/Puzzle";

interface Props {
  puzzleWidth: number;
  puzzleState: PuzzleState;
  puzzleDefinition: PuzzleDefinition;
  entryDirection: PuzzleDirection | null;
  selectedCell: CellPosition | null;
  selectedClueNumber: number | null;
  onSelectCell: (position: CellPosition | null) => void;
  onCellValueInput: (position: CellPosition, value: string) => void;
}

const setColumnCount = (columnCount: number) => {
  document.documentElement.style.setProperty("--grid-column-count", `${columnCount}`);
};

const isSelectedCell = (rowIndex: number, colIndex: number, selectedCell: CellPosition | null): boolean =>
  Boolean(selectedCell && selectedCell.column === colIndex && selectedCell.row === rowIndex);

const isInSelectedWord = (
  rowIndex: number,
  colIndex: number,
  selectedClueNumber: number | null,
  puzzleDefinition: PuzzleDefinition,
  entryDirection: PuzzleDirection | null,
): boolean => {
  if (!selectedClueNumber || !entryDirection) {
    return false;
  }

  const clueInfo = puzzleDefinition.clues.byRowAndColumn[rowIndex][colIndex];

  if (entryDirection === "across") {
    return clueInfo?.acrossClueNumber === selectedClueNumber;
  }

  return clueInfo?.downClueNumber === selectedClueNumber;
};

export const PuzzleGrid = (props: Props): JSX.Element => {
  useEffect(() => setColumnCount(props.puzzleWidth), [props.puzzleWidth]);

  const cells: JSX.Element[] = props.puzzleState.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => (
      <PuzzleCell
        key={`${rowIndex}-${colIndex}`}
        isSelected={isSelectedCell(rowIndex, colIndex, props.selectedCell)}
        isInSelectedWord={isInSelectedWord(
          rowIndex,
          colIndex,
          props.selectedClueNumber,
          props.puzzleDefinition,
          props.entryDirection,
        )}
        onSelectCell={() => {
          props.onSelectCell({
            row: rowIndex,
            column: colIndex,
          });
        }}
        onCellValueInput={(newValue) => props.onCellValueInput({ row: rowIndex, column: colIndex }, newValue)}
        gameCell={cell}
      />
    )),
  );

  return <div className="grid-container">{cells}</div>;
};
