import { memo } from "react";
import { CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import { NarrowScreenClues } from "./clues/NarrowScreenClues";
import { VirtualKeyboard } from "./VirtualKeyboard";

interface Props {
  puzzle: PuzzleDefinition;
  selectedCell: CellPosition;
  fillDirection: FillDirection;
  onSelectClue: (clueNumber: number) => void;
  onToggleFillDirection: () => void;
  onVirtualKeyboardInput: (input: string) => void;
  onVirtualKeyboardBackspace: () => void;
}

function MobileFooterInternal(props: Props): JSX.Element {
  return (
    <div className="mobile-footer">
      <NarrowScreenClues
        fillDirection={props.fillDirection}
        puzzle={props.puzzle}
        selectedCell={props.selectedCell}
        onSelectClue={props.onSelectClue}
        onToggleFillDirection={props.onToggleFillDirection}
      />
      <VirtualKeyboard onKeyboardInput={props.onVirtualKeyboardInput} onBackspace={props.onVirtualKeyboardBackspace} />
    </div>
  );
}

export const MobileFooter = memo(MobileFooterInternal);
