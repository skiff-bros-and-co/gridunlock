import { Icon } from "@blueprintjs/core";
import classNames from "classnames";
import { memo, useCallback, useState, type Touch, type TouchEvent, type TouchList } from "react";

interface Props {
  onKeyboardInput: (input: string) => void;
  onBackspace: () => void;
}

const LAYOUT = ["Q W E R T Y U I O P", "A S D F G H J K L", "Z X C V B N M ⌫"];

function KeyInternal(props: { letter: string; active: boolean }) {
  const { active, letter } = props;

  return (
    <div className={classNames("key", { "-active": active })} data-letter={letter}>
      <div className="inner">{letter !== "⌫" ? letter : <Icon icon="key-backspace" />}</div>
    </div>
  );
}
const Key = memo(KeyInternal);

function getKeyFromTouch(touch: Touch) {
  const el = document.elementFromPoint(touch.pageX, touch.pageY);
  const letter = el?.getAttribute("data-letter");
  if (letter != null) {
    return letter;
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
      {LAYOUT.map((row, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: This is a static sized board
        <div key={index} className="row">
          {row.split(" ").map((key) => (
            <Key key={key} letter={key} active={activeKeys.includes(key)} />
          ))}
        </div>
      ))}
    </div>
  );
}

export const VirtualKeyboard = memo(VirtualKeyboardInternal);
