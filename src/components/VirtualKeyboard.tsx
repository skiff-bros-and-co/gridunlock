import { memo } from "react";
import SimpleKeyboard, { KeyboardLayoutObject } from "react-simple-keyboard";

interface Props {}

const LAYOUT: KeyboardLayoutObject = {
  default: [
    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} q w e r t y u i o p [ ] \\",
    "{lock} a s d f g h j k l ; ' {enter}",
    "{shift} z x c v b n m , . / {shift}",
    ".com @ {space}",
  ],
};

function VirtualKeyboardInternal(props: Props): JSX.Element {
  return <SimpleKeyboard className="virtual-keyboard" layout={LAYOUT} />;
}

export const VirtualKeyboard = memo(VirtualKeyboardInternal);
