import classNames from "classnames";
import { memo, Touch, TouchEvent, TouchList, useCallback, useState } from "react";

interface Props {
  onKeyboardInput: (input: string) => void;
  onBackspace: () => void;
}

const LAYOUT = ["Q W E R T Y U I O P", "A S D F G H J K L", `Z X C V B N M ⌫`];

const KEY_CLASSNAME = "key";
function KeyInternal(props: { letter: string; active: boolean }) {
  const { active, letter } = props;

  return <div className={classNames(KEY_CLASSNAME, { "-backspace": letter === "⌫", "-active": active })}>{letter}</div>;
}
const Key = memo(KeyInternal);

function getKeyFromTouch(touch: Touch) {
  const el = document.elementFromPoint(touch.pageX, touch.pageY);
  if (el?.classList.contains(KEY_CLASSNAME)) {
    return el.textContent;
  }

  return undefined;
}

function getKeysFromTouchList(touches: TouchList) {
  const keys: string[] = [];
  for (const touch of Array.from(touches)) {
    const key = getKeyFromTouch(touch);
    if (key != null) {
      keys.push(key);
    }
  }
  return keys;
}

function VirtualKeyboardInternal(props: Props): JSX.Element {
  const { onBackspace, onKeyboardInput } = props;

  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const handlePress = useCallback(
    (key: string) => {
      if (key === "⌫") {
        onBackspace();
      } else {
        onKeyboardInput(key);
      }
    },
    [onBackspace, onKeyboardInput],
  );

  const handleTouchEvent = useCallback((ev: TouchEvent<HTMLDivElement>) => {
    setActiveKeys(getKeysFromTouchList(ev.targetTouches));
  }, []);

  const handleTouchEnd = useCallback(
    (ev: TouchEvent<HTMLDivElement>) => {
      for (const key of getKeysFromTouchList(ev.changedTouches)) {
        handlePress(key);
      }

      setActiveKeys(getKeysFromTouchList(ev.targetTouches));
    },
    [handlePress],
  );

  return (
    <div
      className="virtual-keyboard"
      onTouchStart={handleTouchEvent}
      onTouchMove={handleTouchEvent}
      onTouchCancel={handleTouchEvent}
      onTouchEnd={handleTouchEnd}
    >
      {LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.split(" ").map((key) => (
            <Key key={key} letter={key} active={activeKeys.includes(key)} />
          ))}
        </div>
      ))}
    </div>
  );
}

export const VirtualKeyboard = memo(VirtualKeyboardInternal);
