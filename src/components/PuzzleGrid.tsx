import { useEffect } from "react";
import { CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import type { PlayerState, PuzzleState } from "../state/State";
import { CellWordPositions } from "../utils/generateCellWordPositions";
import { PuzzleCell } from "./PuzzleCell";

interface Props {
  puzzleWidth: number;
  puzzleState: PuzzleState;
  puzzleDefinition: PuzzleDefinition;
  fillDirection: FillDirection;
  selectedCell: CellPosition | null;
  playersState: PlayerState[];
  cellWordPositions: CellWordPositions;
  onSelectCell: (position: CellPosition | null) => void;
  onCellValueInput: (position: CellPosition, value: string) => void;
}

const setColumnCount = (columnCount: number) => {
  document.documentElement.style.setProperty("--grid-column-count", `${columnCount}`);
};

const isSelectedCell = (rowIndex: number, colIndex: number, selectedCell: CellPosition | null): boolean =>
  Boolean(selectedCell && selectedCell.column === colIndex && selectedCell.row === rowIndex);

const isInSelectedWord = (
  cellToCheck: CellPosition,
  selectedCell: CellPosition | null,
  puzzleDefinition: PuzzleDefinition,
  fillDirection: FillDirection | null,
): boolean => {
  if (!selectedCell || !fillDirection) {
    return false;
  }

  const selectedClueInfo = puzzleDefinition.clues.byRowAndColumn[selectedCell.row][selectedCell.column];
  const checkClueInfo = puzzleDefinition.clues.byRowAndColumn[cellToCheck.row][cellToCheck.column];

  if (!selectedClueInfo || !checkClueInfo) {
    return false;
  }

  if (fillDirection === "across") {
    return checkClueInfo.acrossClueNumber === selectedClueInfo.acrossClueNumber;
  }

  return checkClueInfo.downClueNumber === selectedClueInfo.downClueNumber;
};

export const PuzzleGrid = (props: Props): JSX.Element => {
  useEffect(() => setColumnCount(props.puzzleWidth), [props.puzzleWidth]);

  const cells: JSX.Element[] = props.puzzleState.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => (
      <PuzzleCell
        key={`${rowIndex}-${colIndex}`}
        isSelected={isSelectedCell(rowIndex, colIndex, props.selectedCell)}
        isInSelectedWord={isInSelectedWord(
          {
            row: rowIndex,
            column: colIndex,
          },
          props.selectedCell,
          props.puzzleDefinition,
          props.fillDirection,
        )}
        row={rowIndex}
        column={colIndex}
        wordPosition={props.cellWordPositions[rowIndex][colIndex]}
        fillDirection={props.fillDirection}
        playersState={props.playersState}
        gameCell={cell}
        onSelectCell={() => {
          props.onSelectCell({
            row: rowIndex,
            column: colIndex,
          });
        }}
        onCellValueInput={(newValue) => props.onCellValueInput({ row: rowIndex, column: colIndex }, newValue)}
      />
    )),
  );

  return (
    <div className="puzzle-container">
      <h3 className="puzzle-title">{props.puzzleDefinition.title}</h3>
      <h5 className="puzzle-author">{props.puzzleDefinition.author}</h5>
      <div className="grid-container">{cells}</div>
      <div className="puzzle-copyright">© {props.puzzleDefinition.copyright}</div>
    </div>
  );
};
