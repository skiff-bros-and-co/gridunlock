import { Icon } from "@blueprintjs/core";
import { memo, useCallback } from "react";
import { CellPosition, Clue, FillDirection, PuzzleDefinition } from "../../state/Puzzle";
import { getNextClueNumber } from "../../utils/getNextCell";
import { getAcrossClueNumber, getDownClueNumber } from "./clueUtils";

interface Props {
  puzzle: PuzzleDefinition;
  selectedCell: CellPosition;
  fillDirection: FillDirection;
  onSelectClue: (clueNumber: number) => void;
  onToggleFillDirection: () => void;
}

function NarrowScreenCluesInternal(props: Props): JSX.Element {
  const { fillDirection, puzzle, selectedCell, onSelectClue } = props;

  const selectedClueNumber =
    fillDirection === "across"
      ? getAcrossClueNumber(selectedCell, props.puzzle)
      : getDownClueNumber(selectedCell, props.puzzle);
  const selectedClue: Clue | undefined =
    fillDirection === "across"
      ? puzzle.clues.across[selectedClueNumber ?? -1]
      : puzzle.clues.down[selectedClueNumber ?? -1];

  const handleLeft = useCallback(() => {
    if (selectedClueNumber != null) {
      onSelectClue(getNextClueNumber(fillDirection, selectedClueNumber, true, puzzle));
    }
  }, [fillDirection, onSelectClue, puzzle, selectedClueNumber]);
  const handleRight = useCallback(() => {
    if (selectedClueNumber != null) {
      onSelectClue(getNextClueNumber(fillDirection, selectedClueNumber, false, puzzle));
    }
  }, [fillDirection, onSelectClue, puzzle, selectedClueNumber]);

  return (
    <div className="puzzle-clues-narrow">
      <div className="button" onClick={handleLeft}>
        <Icon icon={"caret-left"} />
      </div>
      <div className="button clue" onClick={props.onToggleFillDirection}>
        {selectedClue?.clue ?? ""}
      </div>
      <div className="button" onClick={handleRight}>
        <Icon icon={"caret-right"} />
      </div>
    </div>
  );
}

export const NarrowScreenClues = memo(NarrowScreenCluesInternal);
