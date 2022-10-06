import { useEffect } from "react";
import { useRef } from "react";
import type { PuzzleGameCell } from "../state/State";

interface Props {
  gameCell: PuzzleGameCell;
  onSelectCell: () => void;
  onCellValueInput: (newValue: string) => void;
  isSelected: boolean;
}

export const PuzzleCell = (props: Props): JSX.Element => {
  const inputRef = useRef<null | HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    if (props.isSelected) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
    }
  }, [inputRef, props.isSelected]);

  if (props.gameCell.isBlocked) {
    return <div className="grid-cell" />;
  }

  const inputClassFilled = `grid-cell-${props.gameCell.filledValue === "" ? "empty" : "filled"}`;
  const inputClassSelected = props.isSelected ? "grid-cell-selected" : "";
  const hintClassSelected = props.isSelected ? "grid-cell-hint-number-selected" : "";

  return (
    <div className="grid-cell-wrapper">
      <input
        ref={inputRef}
        className={`grid-cell ${inputClassFilled} ${inputClassSelected}`}
        onFocus={props.onSelectCell}
        onClick={props.onSelectCell}
        value={props.gameCell.filledValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onCellValueInput(e.target.value)}
      />
      <p className={`grid-cell-hint-number ${hintClassSelected}`}>{props.gameCell.clueNumber}</p>
    </div>
  );
};
