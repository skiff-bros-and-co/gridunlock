import { PuzzleDefinition } from "../state/Puzzle";

interface Props {
  puzzleDefinition: PuzzleDefinition;
}

export const PuzzleHints = (props: Props): JSX.Element => {
  return (
    <div>
      <h3>across</h3>
      <ul>
        {Object.values(props.puzzleDefinition.clues.across).map((clue) => {
          return (
            <li>
              {clue.clueNumber}. {clue.clue}
            </li>
          );
        })}
      </ul>
      <h3>down</h3>
      <ul>
        {Object.values(props.puzzleDefinition.clues.down).map((clue) => {
          return (
            <li>
              {clue.clueNumber}. {clue.clue}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
