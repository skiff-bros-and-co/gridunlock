import { useRef } from "react";
import type { PuzzleGameCell } from "../state/State";

interface Props {
  gameCell: PuzzleGameCell;
  onSelectCell: () => void;
  isSelected: boolean;
}

export const PuzzleCell = (props: Props): JSX.Element => {
  const inputRef = useRef<null | HTMLInputElement>(null);

  if (props.gameCell.isBlocked) {
    return <div className="grid-cell" />;
  }

  const inputClassFilled = `grid-cell-${props.gameCell.filledValue === "" ? "empty" : "filled"}`;
  const inputClassSelected = props.isSelected ? "grid-cell-selected" : "";
  const hintClassSelected = props.isSelected ? "grid-cell-hint-number-selected" : "";

  return (
    <div className="grid-cell-wrapper">
      <div
        ref={inputRef}
        className={`grid-cell ${inputClassFilled} ${inputClassSelected}`}
        onFocus={props.onSelectCell}
        onClick={props.onSelectCell}
      >
        {props.gameCell.filledValue}
      </div>
      <p className={`grid-cell-hint-number ${hintClassSelected}`}>{props.gameCell.clueNumber}</p>
    </div>
  );
};
