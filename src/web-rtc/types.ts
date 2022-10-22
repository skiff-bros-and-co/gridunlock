import { SyncedImmutableMap } from "../components/useSyncedMap";
import { CellPosition } from "../state/Puzzle";

export type SyncedPuzzleState = SyncedImmutableMap<SyncedPuzzleCellState>;

export interface SyncedPuzzleCellState {
  value: string;
  isMarkedIncorrect: boolean;
}

export interface SyncedPlayerState {
  info: SyncedPlayerInfo;
  position: CellPosition | undefined;
}

export interface SyncedPlayerInfo {
  name: string;
  joinTimeUtcMs: number;
  clientID: number;
}
