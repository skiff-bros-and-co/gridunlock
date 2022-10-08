import { useMemo, useRef } from "react";
import { CellPosition, Clue, PuzzleDefinition } from "../state/Puzzle";
import { PuzzleHintRow } from "./PuzzleHintRow";

interface Props {
  puzzleDefinition: PuzzleDefinition;
  selectedCell: CellPosition | null;
}

const getAcrossClueNumber = (puzzleDefinition: PuzzleDefinition, cellPosition: CellPosition | null): number | null => {
  if (cellPosition == null) {
    return null;
  }

  return puzzleDefinition.clues.byRowAndColumn[cellPosition.row][cellPosition.column]?.acrossClueNumber || null;
};

const getDownClueNumber = (puzzleDefinition: PuzzleDefinition, cellPosition: CellPosition | null): number | null => {
  if (cellPosition == null) {
    return null;
  }

  return puzzleDefinition.clues.byRowAndColumn[cellPosition.row][cellPosition.column]?.downClueNumber || null;
};

export const PuzzleHints = (props: Props): JSX.Element => {
  const selectedAcrossClueNumber = useMemo(
    () => getAcrossClueNumber(props.puzzleDefinition, props.selectedCell),
    [props.puzzleDefinition, props.selectedCell],
  );
  const selectedDownClueNumber = useMemo(
    () => getDownClueNumber(props.puzzleDefinition, props.selectedCell),
    [props.puzzleDefinition, props.selectedCell],
  );

  return (
    <div className="puzzle-hints-desktop">
      <h3 className="puzzle-hint-list-title">across</h3>
      <div className="puzzle-hints-across">
        <ul className="puzzle-hint-list">
          {Object.values(props.puzzleDefinition.clues.across).map((clue) => (
            <PuzzleHintRow
              key={`across-${clue.clueNumber}`}
              clue={clue}
              isSelected={clue.clueNumber === selectedAcrossClueNumber}
            />
          ))}
        </ul>
      </div>
      <h3 className="puzzle-hint-list-title">down</h3>
      <div className="puzzle-hints-down">
        <ul className="puzzle-hint-list">
          {Object.values(props.puzzleDefinition.clues.down).map((clue) => (
            <PuzzleHintRow
              key={`down-${clue.clueNumber}`}
              clue={clue}
              isSelected={clue.clueNumber === selectedDownClueNumber}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};
