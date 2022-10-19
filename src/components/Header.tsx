import { AnchorButton, Button, ButtonGroup } from "@blueprintjs/core";
import { memo, useCallback } from "react";
import gridUnlockIcon from "../assets/grid-unlock.svg";

function HeaderInternal(): JSX.Element {
  const newRoom = useCallback(() => {
    window.location.pathname = "/";
  }, []);

  return (
    <div className="page-header">
      <h1>Grid Unlock</h1>
      <img src={gridUnlockIcon} className="grid-unlock-icon" alt="Grid Unlock Logo" />
      <ButtonGroup className="buttons" minimal={true}>
        <Button icon="grid-view" onClick={newRoom}>
          New Room
        </Button>
        <AnchorButton rightIcon="caret-down"></AnchorButton>
      </ButtonGroup>
    </div>
  );
}

export const Header = memo(HeaderInternal);
