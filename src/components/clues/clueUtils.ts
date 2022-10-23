import { CellPosition, PuzzleDefinition } from "../../state/Puzzle";

export const getAcrossClueNumber = (position: CellPosition, puzzle: PuzzleDefinition): number | undefined => {
  return puzzle.clues.byRowAndColumn[position.row][position.column]?.acrossClueNumber;
};

export const getDownClueNumber = (position: CellPosition, puzzle: PuzzleDefinition): number | undefined => {
  return puzzle.clues.byRowAndColumn[position.row][position.column]?.downClueNumber;
};
