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
  onToggleFillDirection: () => void;
  onCellValueInput: (newValue: string) => void;
}

function PuzzleCellInternal(props: Props): JSX.Element {
  const { row, column, selectedColor, isSelected, onSelectCell, onToggleFillDirection, onCellValueInput } = props;
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
  }, [inputRef, props.isSelected, props.fillDirection]);

  const handleClick = useCallback(() => {
    if (isSelected) {
      onToggleFillDirection();
    } else {
      onSelectCell({ row, column });
    }
  }, [isSelected, onToggleFillDirection, onSelectCell, row, column]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCellValueInput(e.target.value),
    [onCellValueInput],
  );

  if (props.gameCell.isBlocked) {
    return <div className="puzzle-cell" />;
  }

  return (
    <div
      className={classnames("puzzle-cell -unblocked", {
        "-local-player-selected": props.isSelected,
        "-in-selected-word": props.isInSelectedWord,
        "-marked-incorrect": props.gameCell.isMarkedIncorrect,
        "-filling-across": props.fillDirection === "across",
        "-filling-down": props.fillDirection === "down",
        "-filling-word-start": props.fillDirection && props.wordPosition[props.fillDirection] === "start",
        "-filling-word-middle": props.fillDirection && props.wordPosition[props.fillDirection] === "middle",
        "-filling-word-end": props.fillDirection && props.wordPosition[props.fillDirection] === "end",
      })}
      style={{ borderColor: selectedColor }}
      onClick={handleClick}
    >
      <div className="clue-number">{props.gameCell.clueNumber} </div>
      <input
        ref={inputRef}
        className="content"
        value={props.gameCell.filledValue}
        type="text"
        inputMode="none"
        spellCheck="false"
        tabIndex={-1}
        onChange={handleChange}
      />
    </div>
  );
}

export const PuzzleCell = memo(PuzzleCellInternal);
