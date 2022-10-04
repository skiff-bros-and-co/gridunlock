import { useEffect, useRef } from "react";
import { SingleLetter } from "../state/Puzzle";
import type { PuzzleGameCell } from "../state/State";

interface Props {
  gameCell: PuzzleGameCell;
  onEnterValue: (value: SingleLetter | "") => void;
  onSelectCell: () => void;
  isSelected: boolean;
}

const alphaCharacterRegex = /^[A-Za-z]$/;

const getValidInput = (input: string): SingleLetter | "" | null => {
  if (input.length === 0) {
    return "";
  }

  if (input.length === 1 && input[0].match(alphaCharacterRegex)) {
    return input[0].toUpperCase() as SingleLetter;
  }

  if (input.length === 2 && input[1].match(alphaCharacterRegex)) {
    return input[1].toUpperCase() as SingleLetter;
  }

  return null;
};

export const PuzzleCell = (props: Props): JSX.Element => {
  const inputRef = useRef<null | HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef?.current && props.isSelected) {
      inputRef.current.focus();
    }
  }, [props.isSelected, inputRef]);

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
        onChange={(event) => {
          const validInput = getValidInput(event.target.value);

          if (validInput !== null) {
            props.onEnterValue(validInput);
          }
        }}
        value={props.gameCell.filledValue}
      />
      <p className={`grid-cell-hint-number ${hintClassSelected}`}>{props.gameCell.clueNumber}</p>
    </div>
  );
};
