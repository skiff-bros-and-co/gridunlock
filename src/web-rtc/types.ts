import { CellPosition } from "../state/Puzzle";

export interface SyncedPuzzleState {
  cells: SyncedPuzzleCellState[][];
}

export interface SyncedPuzzleCellState {
  value: string;
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
