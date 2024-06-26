import type { CellPosition } from "./Puzzle";

export interface PuzzleGameCell {
  filledValue: string;
  isBlocked: boolean;
  clueNumber?: number;
  isMarkedIncorrect: boolean;
}

export type PuzzleState = PuzzleGameCell[][];

export interface PlayerState {
  name: string;
  index: number;
  position: CellPosition | undefined;
  isLocalPlayer: boolean;
}
