import { CellPosition, PuzzleDefinition } from "../state/Puzzle";

interface Props {
  puzzleDefinition: PuzzleDefinition;
  selectedCell: CellPosition | null;
}

const getAcrossClueNumber = (
  puzzleDefinition: PuzzleDefinition,
  cellPosition: CellPosition | null,
): number | undefined => {
  if (cellPosition === null) {
    return undefined;
  }

  return puzzleDefinition.clues.byRowAndColumn[cellPosition.row][cellPosition.column]?.acrossClueNumber;
};

const getDownClueNumber = (
  puzzleDefinition: PuzzleDefinition,
  cellPosition: CellPosition | null,
): number | undefined => {
  if (cellPosition === null) {
    return undefined;
  }

  return puzzleDefinition.clues.byRowAndColumn[cellPosition.row][cellPosition.column]?.downClueNumber;
};

export const PuzzleHints = (props: Props): JSX.Element => {
  const selectedAcrossClueNumber = getAcrossClueNumber(props.puzzleDefinition, props.selectedCell);
  const selectedDownClueNumber = getDownClueNumber(props.puzzleDefinition, props.selectedCell);

  return (
    <div>
      <h3>across</h3>
      <ul>
        {Object.values(props.puzzleDefinition.clues.across).map((clue) => {
          return (
            <li className={clue.clueNumber === selectedAcrossClueNumber ? "selected-puzzle-hint" : ""}>
              {clue.clueNumber}. {clue.clue}
            </li>
          );
        })}
      </ul>
      <h3>down</h3>
      <ul>
        {Object.values(props.puzzleDefinition.clues.down).map((clue) => {
          return (
            <li className={clue.clueNumber === selectedDownClueNumber ? "selected-puzzle-hint" : ""}>
              {clue.clueNumber}. {clue.clue}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
