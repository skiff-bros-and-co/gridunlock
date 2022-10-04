import { useEffect, useRef } from "react";
import { SingleLetter } from "../state/Puzzle";
import type { PuzzleGameCell } from "../state/State";

interface Props {
  gameCell: PuzzleGameCell;
  onEnterValue: (value: SingleLetter | "") => void;
  onSelectCell: () => void;
  isSelected: boolean;
}

const getValidInput = (input: string): SingleLetter | "" | null => {
  if (input.length === 0) {
    return "";
  }

  if (input[0].match(/^[A-Za-z]$/)) {
    return input[0].toUpperCase() as SingleLetter;
  }

  return null;
};

export const PuzzleCell = (props: Props): JSX.Element => {
  // TODO: better types
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (inputRef?.current && props.isSelected) {
      inputRef.current.focus();
    }
  }, [props.isSelected, inputRef]);

  if (props.gameCell.isBlocked) {
    return <div className="grid-cell" />;
  }

  return (
    <div className="grid-cell-wrapper">
      <input
        ref={inputRef}
        className={`grid-cell grid-cell-${props.gameCell.filledValue === "" ? "empty" : "filled"}`}
        onFocus={props.onSelectCell}
        onChange={(event) => {
          const validInput = getValidInput(event.target.value);

          if (validInput !== null) {
            props.onEnterValue(validInput);
          }
        }}
        value={props.gameCell.filledValue}
      />
      <p className="grid-cell-hint-number">{props.gameCell.clueNumber}</p>
    </div>
  );
};
