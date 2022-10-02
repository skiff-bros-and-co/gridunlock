import { useEffect } from "react";
import type { PuzzleState } from "../state/State";
import { PuzzleCell } from "./PuzzleCell";

interface Props {
  puzzleState: PuzzleState;
}

const setColumnCount = (columnCount: number) => {
  document.documentElement.style.setProperty("--grid-column-count", `${columnCount}`);
};

export const PuzzleGrid = (props: Props): JSX.Element => {
  useEffect(() => setColumnCount(props.puzzleState?.length), [props.puzzleState[0]?.length]);

  const cells: JSX.Element[] = props.puzzleState.flatMap((row) => row.map((cell) => <PuzzleCell gameCell={cell} />));

  return <div className="grid-container">{cells}</div>;
};
