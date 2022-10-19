import { PlayerState } from "../state/State";

const PLAYER_COLORS = [
  "#29A634",
  "#2965CC",
  "#D99E0B",
  "#D13913",
  "#8F398F",
  "#00B3A4",
  "#DB2C6F",
  "#9BBF30",
  "#96622D",
  "#7157D9",
];

export function getColorForPlayer(player: PlayerState | undefined): string {
  if (player == null) {
    return "transparent";
  }

  return PLAYER_COLORS[player.index];
}
