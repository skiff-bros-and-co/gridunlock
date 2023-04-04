export interface IntermediatePuzzleClues {
  across: { [clueNumber: number]: string };
  down: { [clueNumber: number]: string };
  byCell: (number | undefined)[][];
}

export interface IntermediatePuzzleDefinition {
  title: string;
  author: string;
  description: string;
  copyright: string;
  /**
   * The puzzle grid, as a 2D array of strings.
   * Each cell is either a "." (indicating a blocked cell) or a string of length >= 1.
   * REBUS values _are_ allowed.
   */
  cells: string[][];
  clues: IntermediatePuzzleClues;
  width: number;
  height: number;
}
