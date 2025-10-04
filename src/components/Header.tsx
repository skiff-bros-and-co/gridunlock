import { AnchorButton, Button, ButtonGroup, Menu, MenuItem, Popover, Position } from "@blueprintjs/core";
import { CaretDown, GridView, Tick } from "@blueprintjs/icons";
import { memo, useCallback } from "react";
import gridUnlockIcon from "../assets/grid-unlock.svg";

interface Props {
  onCheckPuzzle: () => void;
}

function HeaderMenu(props: Props): JSX.Element {
  return (
    <Menu>
      <MenuItem icon={<Tick />} text="Check Puzzle" onClick={props.onCheckPuzzle} />
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
      <ButtonGroup className="buttons" variant="minimal">
        <Button icon={<GridView />} onClick={newRoom}>
          New Room
        </Button>
        <Popover content={<HeaderMenu onCheckPuzzle={props.onCheckPuzzle} />} position={Position.BOTTOM}>
          <AnchorButton endIcon={<CaretDown />} />
        </Popover>
      </ButtonGroup>
    </div>
  );
}

export const Header = memo(HeaderInternal);
