import { useEffect } from "react";
import type { PuzzleState } from "../state/State";
import { PuzzleCell } from "./PuzzleCell";
import { SingleLetter } from "../state/Puzzle";

interface Props {
  puzzleWidth: number;
  puzzleState: PuzzleState;
  onEnterValue: (row: number, column: number, value: SingleLetter | "") => void;
}

const setColumnCount = (columnCount: number) => {
  document.documentElement.style.setProperty("--grid-column-count", `${columnCount}`);
};

export const PuzzleGrid = (props: Props): JSX.Element => {
  useEffect(() => setColumnCount(props.puzzleWidth), [props.puzzleWidth]);

  const cells: JSX.Element[] = props.puzzleState.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => (
      <PuzzleCell
        key={`${rowIndex}-${colIndex}`}
        onSelectCell={() => {
          console.log(`selected cell r${rowIndex}c${colIndex}`);
        }}
        onEnterValue={(newValue) => {
          props.onEnterValue(rowIndex, colIndex, newValue);
        }}
        gameCell={cell}
      />
    )),
  );

  return <div className="grid-container">{cells}</div>;
};
