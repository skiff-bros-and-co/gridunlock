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
      <img src={gridUnlockIcon} className="app-icon" alt="Grid" onClick={newRoom} />
      <h1 className="app-title">Grid Unlock</h1>
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
