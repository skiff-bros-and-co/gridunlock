import { memo } from "react";
import { VirtualKeyboard } from "./VirtualKeyboard";

interface Props {
  onVirtualKeyboardInput: (input: string) => void;
  onVirtualKeyboardBackspace: () => void;
}

function MobileFooterInternal(props: Props): JSX.Element {
  return (
    <div className="mobile-footer">
      <VirtualKeyboard onKeyboardInput={props.onVirtualKeyboardInput} onBackspace={props.onVirtualKeyboardBackspace} />
    </div>
  );
}

export const MobileFooter = memo(MobileFooterInternal);
