import type { PuzzleGameCell } from "../state/State";
import { PuzzleCell } from "./PuzzleCell";

interface Props {
  filledCellsByRow: PuzzleGameCell[][];
}

export const PuzzleView = (props: Props): JSX.Element => {
  const cells: JSX.Element[] = props.filledCellsByRow.flatMap((row) =>
    row.map((cell) => {
      return <PuzzleCell cell={cell} />;
    }),
  );

  return <div className="grid-container">{cells}</div>;
};
