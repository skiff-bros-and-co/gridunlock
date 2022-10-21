import { memo } from "react";
import SimpleKeyboard, { KeyboardLayoutObject } from "react-simple-keyboard";

interface Props {
  onChange: (input: string) => void;
}

const LAYOUT: KeyboardLayoutObject = {
  default: ["q w e r t y u i o p", "a s d f g h j k l", "< > z x c v b n m {bksp}"],
};

const DISPLAY = {
  "{bksp}": "⌫",
};

function VirtualKeyboardInternal(props: Props): JSX.Element {
  return (
    <SimpleKeyboard
      theme="hg-theme-default virtual-keyboard"
      layout={LAYOUT}
      display={DISPLAY}
      onChange={props.onChange}
    />
  );
}

export const VirtualKeyboard = memo(VirtualKeyboardInternal);
