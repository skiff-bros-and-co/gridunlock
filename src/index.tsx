import * as ReactDOM from "react-dom";
import { Root } from "./components/Root";
import { generateRoomCode } from "./utils/generateRoomCode";

const ROOM_CODE_PARAM = "roomcode";

const queryParams = new URLSearchParams(window.location.search);
const roomCode = queryParams.get(ROOM_CODE_PARAM);
if (roomCode === null) {
  queryParams.set(ROOM_CODE_PARAM, generateRoomCode());
  window.location.search = queryParams.toString();
} else {
  ReactDOM.render(<Root roomCode={roomCode} />, document.getElementById("content"));
}
