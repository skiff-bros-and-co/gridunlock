import { memo, useMemo } from "react";
import { CellPosition, PuzzleDefinition } from "../state/Puzzle";
import { PuzzleClueRow } from "./PuzzleClueRow";

interface Props {
  puzzle: PuzzleDefinition;
  selectedCell: CellPosition | undefined;
}

const getAcrossClueNumber = (puzzle: PuzzleDefinition, cellPosition: CellPosition | undefined): number | null => {
  if (cellPosition == null) {
    return null;
  }

  return puzzle.clues.byRowAndColumn[cellPosition.row][cellPosition.column]?.acrossClueNumber || null;
};

const getDownClueNumber = (puzzle: PuzzleDefinition, cellPosition: CellPosition | undefined): number | null => {
  if (cellPosition == null) {
    return null;
  }

  return puzzle.clues.byRowAndColumn[cellPosition.row][cellPosition.column]?.downClueNumber || null;
};

function PuzzleCluesInternal(props: Props): JSX.Element {
  const selectedAcrossClueNumber = useMemo(
    () => getAcrossClueNumber(props.puzzle, props.selectedCell),
    [props.puzzle, props.selectedCell],
  );
  const selectedDownClueNumber = useMemo(
    () => getDownClueNumber(props.puzzle, props.selectedCell),
    [props.puzzle, props.selectedCell],
  );

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
