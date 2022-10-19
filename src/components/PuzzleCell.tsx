import classnames from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { CellPosition, FillDirection } from "../state/Puzzle";
import type { PlayerState, PuzzleGameCell } from "../state/State";
import { CellWordPosition } from "../utils/generateCellWordPositions";
import { getColorForPlayer } from "../utils/getColorForPlayerIndex";

interface Props {
  gameCell: PuzzleGameCell;
  isSelected: boolean;
  isInSelectedWord: boolean;
  playersState: PlayerState[];
  row: number;
  column: number;
  wordPosition: CellWordPosition;
  fillDirection: FillDirection | null;

  onSelectCell: (position: CellPosition) => void;
  onCellValueInput: (position: CellPosition, newValue: string) => void;
}

export const PuzzleCell = (props: Props): JSX.Element => {
  const { row, column, onSelectCell, onCellValueInput } = props;
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

  const handleClick = useCallback(() => {
    onSelectCell({ row, column });
  }, [row, column, onSelectCell]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCellValueInput({ row, column }, e.target.value),
    [column, onCellValueInput, row],
  );

  if (props.gameCell.isBlocked) {
    return <div className="grid-cell" />;
  }

  const playerToShowForCell = props.playersState.filter(
    (p) => p.position?.row === props.row && p.position?.column === props.column,
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
          "-filling-across": props.fillDirection === "across",
          "-filling-down": props.fillDirection === "down",
          "-filling-word-start": props.fillDirection && props.wordPosition[props.fillDirection] === "start",
          "-filling-word-middle": props.fillDirection && props.wordPosition[props.fillDirection] === "middle",
          "-filling-word-end": props.fillDirection && props.wordPosition[props.fillDirection] === "end",
        })}
        style={{ borderColor: getColorForPlayer(playerToShowForCell) }}
        value={props.gameCell.filledValue}
        type="text"
        autoCapitalize="characters"
        onClick={handleClick}
        onChange={handleChange}
      />
      <p className={`grid-cell-clue-number`}>{props.gameCell.clueNumber}</p>
    </div>
  );
};
