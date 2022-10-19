import classnames from "classnames";
import { useEffect, useRef } from "react";
import { CellPosition, FillDirection } from "../state/Puzzle";
import type { PlayerState, PuzzleGameCell } from "../state/State";
import { CellWordPosition } from "../utils/generateCellWordPositions";
import { getColorForPlayer } from "../utils/getColorForPlayerIndex";

interface Props {
  gameCell: PuzzleGameCell;
  onSelectCell: () => void;
  onCellValueInput: (newValue: string) => void;
  isSelected: boolean;
  isInSelectedWord: boolean;
  playersState: PlayerState[];
  position: CellPosition;
  wordPosition: CellWordPosition;
  direction: FillDirection | null;
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

  const playerToShowForCell = props.playersState.filter(
    (p) => p.position?.row === props.position?.row && p.position?.column === props.position.column,
  )[0];

  return (
    <div
      className={classnames("grid-cell-wrapper", {
        "-player-selected": playerToShowForCell != null,
        "-local-player-selected": props.isSelected,
        "-in-selected-word": props.isInSelectedWord,
      })}
    >
      <input
        ref={inputRef}
        className={classnames("grid-cell", {
          "-filling-across": props.direction === "across",
          "-filling-down": props.direction === "down",
          "-filling-word-start": props.direction && props.wordPosition[props.direction] === "start",
          "-filling-word-middle": props.direction && props.wordPosition[props.direction] === "middle",
          "-filling-word-end": props.direction && props.wordPosition[props.direction] === "end",
        })}
        style={{ borderColor: getColorForPlayer(playerToShowForCell) }}
        onClick={props.onSelectCell}
        value={props.gameCell.filledValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onCellValueInput(e.target.value)}
        type="text"
        autoCapitalize="characters"
      />
      <p className={`grid-cell-clue-number`}>{props.gameCell.clueNumber}</p>
    </div>
  );
};
