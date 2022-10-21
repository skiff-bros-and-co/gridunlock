import { memo, useCallback } from "react";
import SimpleKeyboard, { KeyboardLayoutObject } from "react-simple-keyboard";

interface Props {
  onKeyboardInput: (input: string) => void;
  onBackspace: () => void;
}

const LAYOUT: KeyboardLayoutObject = {
  default: ["Q W E R T Y U I O P", "A S D F G H J K L", `Z X C V B N M ⌫`],
};

function VirtualKeyboardInternal(props: Props): JSX.Element {
  const { onBackspace, onKeyboardInput } = props;

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === "⌫") {
        onBackspace();
      } else {
        onKeyboardInput(key);
      }
    },
    [onBackspace, onKeyboardInput],
  );

  return (
    <SimpleKeyboard
      theme="virtual-keyboard"
      layout={LAYOUT}
      buttonTheme={[{ buttons: "⌫", class: "-backspace" }]}
      useTouchEvents={true}
      onKeyPress={handleKeyPress}
    />
  );
}

export const VirtualKeyboard = memo(VirtualKeyboardInternal);
