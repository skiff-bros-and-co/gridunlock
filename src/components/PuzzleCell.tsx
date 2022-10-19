import { useEffect, useRef } from "react";
import { CellPosition } from "../state/Puzzle";
import type { PlayerState, PuzzleGameCell } from "../state/State";
import { getColorForPlayer } from "../utils/getColorForPlayerIndex";

interface Props {
  gameCell: PuzzleGameCell;
  onSelectCell: () => void;
  onCellValueInput: (newValue: string) => void;
  isSelected: boolean;
  isInSelectedWord: boolean;
  playersState: PlayerState[];
  position: CellPosition;
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
  const inputClassInSelectedWord = props.isInSelectedWord ? "grid-cell-in-selected-word" : "";
  const hintClassSelected = props.isSelected ? "grid-cell-hint-number-selected" : "";

  const playerToShowForCell = props.playersState.filter(
    (p) => p.position?.row === props.position?.row && p.position?.column === props.position.column,
  )[0];
  const inputClassSelected = playerToShowForCell != null ? "grid-cell-selected" : "";

  return (
    <div className="grid-cell-wrapper">
      <input
        ref={inputRef}
        className={`grid-cell ${inputClassFilled} ${inputClassSelected} ${inputClassInSelectedWord}`}
        style={{ borderColor: getColorForPlayer(playerToShowForCell) }}
        onClick={props.onSelectCell}
        value={props.gameCell.filledValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onCellValueInput(e.target.value)}
        type="text"
        autoCapitalize="characters"
      />
      <p className={`grid-cell-hint-number ${hintClassSelected}`}>{props.gameCell.clueNumber}</p>
    </div>
  );
};
