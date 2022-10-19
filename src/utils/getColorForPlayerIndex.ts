import { Colors } from "@blueprintjs/core";
import { PlayerState } from "../state/State";

export function getColorForPlayer(player: PlayerState | undefined) {
  if (player == null) {
    return "transparent";
  }

  return [Colors.GREEN1, Colors.BLUE1][player.index];
}
