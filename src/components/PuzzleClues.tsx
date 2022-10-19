import { useMemo } from "react";
import { CellPosition, PuzzleDefinition } from "../state/Puzzle";
import { PuzzleClueRow } from "./PuzzleClueRow";

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

export const PuzzleClues = (props: Props): JSX.Element => {
  const selectedAcrossClueNumber = useMemo(
    () => getAcrossClueNumber(props.puzzleDefinition, props.selectedCell),
    [props.puzzleDefinition, props.selectedCell],
  );
  const selectedDownClueNumber = useMemo(
    () => getDownClueNumber(props.puzzleDefinition, props.selectedCell),
    [props.puzzleDefinition, props.selectedCell],
  );

  return (
    <div className="puzzle-clues-desktop">
      <h3 className="puzzle-clue-list-title">across</h3>
      <div className="puzzle-clues-across">
        <ul className="puzzle-clue-list">
          {Object.values(props.puzzleDefinition.clues.across).map((clue) => (
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
          {Object.values(props.puzzleDefinition.clues.down).map((clue) => (
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
};
