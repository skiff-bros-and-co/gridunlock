import type { PuzzleGameCell } from "../state/State";

interface Props {
  gameCell: PuzzleGameCell;
}

export const PuzzleCell = (props: Props): JSX.Element => {
  if (props.gameCell.isBlocked) {
    return <div className="grid-cell" />;
  }

  if (props.gameCell.filledValue === "") {
    return <div className="grid-cell grid-cell-empty" />;
  }

  return <div className="grid-cell grid-cell-filled">{props.gameCell.filledValue}</div>;
};
