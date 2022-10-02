import { PuzzleGameCell } from "../state/State";

interface Props {
  cell: PuzzleGameCell;
}

export const PuzzleCell = (props: Props): JSX.Element => {
  return (
    <div className={props.cell.filledValue === "" ? "grid-cell" : "grid-cell grid-cell-filled"}>
      <p>{props.cell.filledValue}</p>
    </div>
  );
};
