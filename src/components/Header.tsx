import { AnchorButton, Button, ButtonGroup, Menu, MenuItem, Position } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { memo, useCallback } from "react";
import gridUnlockIcon from "../assets/grid-unlock.svg";

interface Props {
  onCheckPuzzle: () => void;
}

function HeaderMenu(props: Props): JSX.Element {
  return (
    <Menu>
      <MenuItem icon={"tick"} text="Check Puzzle" onClick={props.onCheckPuzzle} />
    </Menu>
  );
}

function HeaderInternal(props: Props): JSX.Element {
  const newRoom = useCallback(() => {
    window.location.pathname = "/";
  }, []);

  return (
    <div className="header">
      <h1>Grid Unlock</h1>
      <img src={gridUnlockIcon} className="grid-unlock-icon" alt="Grid Unlock Logo" />
      <ButtonGroup className="buttons" minimal={true}>
        <Button icon="grid-view" onClick={newRoom}>
          New Room
        </Button>
        <Popover2 content={<HeaderMenu onCheckPuzzle={props.onCheckPuzzle} />} position={Position.BOTTOM}>
          <AnchorButton rightIcon="caret-down" />
        </Popover2>
      </ButtonGroup>
    </div>
  );
}

export const Header = memo(HeaderInternal);
