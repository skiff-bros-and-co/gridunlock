import { CellPosition } from "../state/Puzzle";

export interface SyncedPuzzleState {
  cells: SyncedPuzzleCellState[][];
}

export interface SyncedPuzzleCellState {
  value: string;
}

export interface SyncedPlayerState {
  name: string;
  position: CellPosition;
  joinTimeUtcMs: number;
}
