import { SingleLetter } from "../state/Puzzle";
import type { PuzzleGameCell } from "../state/State";

interface Props {
  gameCell: PuzzleGameCell;
  onEnterValue: (value: SingleLetter | "") => void;
  onSelectCell: () => void;
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
  if (props.gameCell.isBlocked) {
    return <div className="grid-cell" />;
  }

  return (
    <input
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
  );
};
