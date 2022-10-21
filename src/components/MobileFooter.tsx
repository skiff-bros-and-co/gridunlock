import { memo } from "react";
import { VirtualKeyboard } from "./VirtualKeyboard";

interface Props {
  onKeyboardInput: (input: string) => void;
}

function MobileFooterInternal(props: Props): JSX.Element {
  return (
    <div className="mobile-footer">
      <VirtualKeyboard onChange={props.onKeyboardInput}></VirtualKeyboard>
    </div>
  );
}

export const MobileFooter = memo(MobileFooterInternal);
