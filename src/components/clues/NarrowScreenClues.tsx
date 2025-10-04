import { Icon } from "@blueprintjs/core";
import { CaretLeft, CaretRight } from "@blueprintjs/icons";
import { memo, useCallback } from "react";
import type { CellPosition, Clue, FillDirection, PuzzleDefinition } from "../../state/Puzzle";
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
      <button className="button" type="button" onClick={handleLeft}>
        <Icon icon={<CaretLeft />} />
      </button>
      <button className="button clue" type="button" onClick={props.onToggleFillDirection}>
        {selectedClue?.clue ?? ""}
      </button>
      <button className="button" type="button" onClick={handleRight}>
        <Icon icon={<CaretRight />} />
      </button>
    </div>
  );
}

export const NarrowScreenClues = memo(NarrowScreenCluesInternal);
