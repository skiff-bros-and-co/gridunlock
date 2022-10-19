import classnames from "classnames";
import { memo, useCallback, useEffect, useRef } from "react";
import { CellPosition, FillDirection } from "../state/Puzzle";
import type { PuzzleGameCell } from "../state/State";
import { CellWordPosition } from "../utils/generateCellWordPositions";

interface Props {
  gameCell: PuzzleGameCell;
  isSelected: boolean;
  isInSelectedWord: boolean;
  row: number;
  column: number;
  wordPosition: CellWordPosition;
  fillDirection: FillDirection | null;
  selectedColor: string | undefined;

  onSelectCell: (position: CellPosition) => void;
  onCellValueInput: (position: CellPosition, newValue: string) => void;
}

function PuzzleCellInternal(props: Props): JSX.Element {
  const { row, column, selectedColor, onSelectCell, onCellValueInput } = props;
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

  return (
    <div
      className={classnames("grid-cell-wrapper", {
        "-player-selected": selectedColor != null,
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
        style={{ borderColor: selectedColor }}
        value={props.gameCell.filledValue}
        type="text"
        autoCapitalize="characters"
        onClick={handleClick}
        onChange={handleChange}
      />
      <p className={`grid-cell-clue-number`}>{props.gameCell.clueNumber}</p>
    </div>
  );
}

export const PuzzleCell = memo(PuzzleCellInternal);
