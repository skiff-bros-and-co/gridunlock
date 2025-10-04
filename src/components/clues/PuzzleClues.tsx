import { memo } from "react";
import type { CellPosition, FillDirection, PuzzleDefinition } from "../../state/Puzzle";
import { getAcrossClueNumber, getDownClueNumber } from "./clueUtils";
import { PuzzleClueRow } from "./PuzzleClueRow";

interface Props {
  puzzle: PuzzleDefinition;
  selectedCell: CellPosition;
  fillDirection: FillDirection;
}

function PuzzleCluesInternal(props: Props): JSX.Element {
  const selectedAcrossClueNumber = getAcrossClueNumber(props.selectedCell, props.puzzle);
  const selectedDownClueNumber = getDownClueNumber(props.selectedCell, props.puzzle);

  return (
    <div className="puzzle-clues-desktop">
      <h3 className="puzzle-clue-list-title">across</h3>
      <div className="puzzle-clues-across">
        <ul className="puzzle-clue-list">
          {Object.values(props.puzzle.clues.across).map((clue) => (
            <PuzzleClueRow
              key={`across-${clue.clueNumber}`}
              clue={clue}
              isSelected={clue.clueNumber === selectedAcrossClueNumber}
            />
          ))}
        </ul>
      </div>
      <h3 className="puzzle-clue-list-title">down</h3>
      <div className="puzzle-clues-down">
        <ul className="puzzle-clue-list">
          {Object.values(props.puzzle.clues.down).map((clue) => (
            <PuzzleClueRow
              key={`down-${clue.clueNumber}`}
              clue={clue}
              isSelected={clue.clueNumber === selectedDownClueNumber}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export const PuzzleClues = memo(PuzzleCluesInternal);
