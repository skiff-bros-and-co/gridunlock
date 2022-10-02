export type SingleLetter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export interface Cell extends CellPosition {
  solution: SingleLetter | ".";
  initialState: SingleLetter | "" | ".";
  isBlocked: boolean;

  clueNumber?: number;
}

export interface Clue {
  clue: string;
  position: CellPosition;
  direction: PuzzleDirection;
  clueNumber: number;
}

export interface CellClue {
  isStartOfClue: boolean;
  acrossClueNumber: number;
  downClueNumber: number;
}

export interface PuzzleClues {
  down: { [clueNumber: number]: Clue };
  across: { [clueNumber: number]: Clue };
  clueCount: number;

  byRowAndColumn: (CellClue | null)[][];
}

export type PuzzleDirection = "down" | "across";

export interface CellPosition {
  row: number;
  column: number;
}

export interface Puzzle {
  title: string;
  author: string;
  description: string;
  copyright: string;
  cells: Cell[][];
  clues: PuzzleClues;
  width: number;
  height: number;
}
