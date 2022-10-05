export interface SyncedRoomInfo {
  puzzleUrl: string | undefined;
}

export interface SyncedPuzzleState {
  cells: SyncedPuzzleCellState[][];
}

export interface SyncedPuzzleCellState {
  value: string;
  writerUserId: string | undefined;
}
