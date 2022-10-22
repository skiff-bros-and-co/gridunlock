export interface Clue {
  clue: string;
  position: CellPosition;
  direction: FillDirection;
  clueNumber: number;
}

export interface CellClue {
  isStartOfClue: boolean;
  acrossClueNumber: number | undefined;
  downClueNumber: number | undefined;
}

export interface PuzzleClues {
  down: { [clueNumber: number]: Clue };
  across: { [clueNumber: number]: Clue };
  clueCount: number;

  byRowAndColumn: (CellClue | null)[][];
}

export type FillDirection = "down" | "across";

export interface CellPosition {
  row: number;
  column: number;
}

export interface CellDefinition extends CellPosition {
  solution: string;
  initialState: string;
  isBlocked: boolean;

  clueNumber?: number;
}

export interface PuzzleDefinition {
  title: string;
  author: string;
  description: string;
  copyright: string;
  cells: CellDefinition[][];
  clues: PuzzleClues;
  width: number;
  height: number;
}
