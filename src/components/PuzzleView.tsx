import { useEffect } from "react";
import type { PuzzleGameCell } from "../state/State";
import { PuzzleCell } from "./PuzzleCell";

interface Props {
  filledCellsByRow: PuzzleGameCell[][];
}

const setColumnCount = (columnCount: number) => {
  document.documentElement.style.setProperty("--grid-column-count", `${columnCount}`);
};

export const PuzzleView = (props: Props): JSX.Element => {
  useEffect(() => setColumnCount(props.filledCellsByRow[0]?.length), [props.filledCellsByRow[0]?.length]);

  const cells: JSX.Element[] = props.filledCellsByRow.flatMap((row) =>
    row.map((cell) => {
      return <PuzzleCell cell={cell} />;
    }),
  );

  return <div className="grid-container">{cells}</div>;
};
