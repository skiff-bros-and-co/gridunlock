import { CellDefinition, CellPosition, Clue, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import { buildCellCluesByRowAndColumn } from "../state/PuzzleDataBuilder";
import { IntermediatePuzzleDefinition } from "./types";

export function parseIntermediatePuzzle(puzzle: IntermediatePuzzleDefinition): PuzzleDefinition {
  const cells = generateCells(puzzle);
  const maxClueNumber = Math.max(
    ...(cells
      .flatMap((row) => row.map((cell) => cell.clueNumber))
      .filter((clueNumber) => clueNumber != null) as number[]),
  );

  return {
    title: puzzle.title,
    description: puzzle.description,
    author: puzzle.author,
    copyright: puzzle.copyright,
    width: puzzle.width,
    height: puzzle.height,
    cells,
    clues: {
      across: parseClues(puzzle.clues.across, "across", cells),
      byRowAndColumn: buildCellCluesByRowAndColumn(cells),
      clueCount: maxClueNumber,
      down: parseClues(puzzle.clues.down, "down", cells),
    },
  };
}

function generateCells(src: IntermediatePuzzleDefinition): CellDefinition[][] {
  const result: CellDefinition[][] = [];

  // grid is a flattened, row major array
  for (let row = 0; row < src.height; row++) {
    const cells: CellDefinition[] = [];
    for (let column = 0; column < src.width; column++) {
      const value = src.cells[row][column];
      cells.push({
        row,
        column,
        solution: value,
        clueNumber: src.clues.byCell[row][column],
        isBlocked: value === ".",
      });
    }
    result.push(cells);
  }

  return result;
}

function parseClues(
  clueStrings: { [clueNumber: number]: string },
  direction: FillDirection,
  cells: CellDefinition[][],
) {
  const result: { [clueNumber: number]: Clue } = Object.create(null);

  const positionLookup: { [clueNumber: number]: CellPosition } = Object.create(null);
  for (let row = 0; row < cells.length; row++) {
    for (let col = 0; col < cells[row].length; col++) {
      const cell = cells[row][col];
      if (cell.clueNumber != null) {
        positionLookup[cell.clueNumber] = {
          row: cell.row,
          column: cell.column,
        };
      }
    }
  }

  for (const clueNumberString of Object.keys(clueStrings)) {
    const clueNumber = Number(clueNumberString);
    const clueString = clueStrings[clueNumber];
    result[clueNumber] = {
      clue: clueString,
      clueNumber,
      direction,
      position: positionLookup[clueNumber],
    };
  }

  return result;
}
