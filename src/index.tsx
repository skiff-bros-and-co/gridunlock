import * as ReactDOM from "react-dom";
import { Root } from "./components/Root";
import { generateMemorableToken } from "./utils/generateMemorableToken";

const ROOM_PATH_PREFIX = "/r/";

const path = window.location.pathname;
const hasRoom = path.startsWith(ROOM_PATH_PREFIX);
const roomName = hasRoom && path.substring(ROOM_PATH_PREFIX.length);
if (!hasRoom || !roomName) {
  window.location.pathname = ROOM_PATH_PREFIX + generateMemorableToken(32);
} else {
  ReactDOM.render(<Root roomName={roomName} />, document.getElementById("content"));
}
