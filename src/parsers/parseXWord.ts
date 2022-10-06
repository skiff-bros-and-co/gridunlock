import { Cell, CellPosition, Clue, PuzzleDefinition, PuzzleDirection } from "../state/Puzzle";
import { buildCellCluesByRowAndColumn } from "../state/PuzzleDataBuilder";

// see: https://www.xwordinfo.com/JSON/
export interface XWordInfoJsonFormat {
  title: string;
  author: string;
  editor: string;
  copyright: string;
  publisher: string;
  date: string;
  size: {
    rows: number;
    cols: number;
  };
  grid: string[];
  gridnums: number[];
  circles: number[];
  clues: {
    across: string[];
    down: string[];
  };
  answers: {
    across: string[];
    down: string[];
  };
  notepad: string;
}

export function parseXWord(src: XWordInfoJsonFormat) {
  const cells = generateCells(src);
  const maxClueNumber = Math.max(
    ...(cells
      .flatMap((row) => row.map((cell) => cell.clueNumber))
      .filter((clueNumber) => clueNumber != null) as number[]),
  );
  const puzzle: PuzzleDefinition = {
    title: src.title,
    author: src.author,
    copyright: src.copyright,
    description: src.notepad,
    height: src.size.rows,
    width: src.size.cols,
    cells: [],
    clues: {
      across: parseClues(src.clues.across, "across", cells),
      byRowAndColumn: buildCellCluesByRowAndColumn(cells),
      clueCount: maxClueNumber,
      down: parseClues(src.clues.down, "down", cells),
    },
  };
  return puzzle;
}

function generateCells(src: XWordInfoJsonFormat): Cell[][] {
  const result: Cell[][] = [];

  // grid is a flattened, row major array
  for (let row = 0; src.size.rows; row++) {
    const cells: Cell[] = [];
    for (let column = 0; src.size.cols; column++) {
      const index = row * src.size.cols + column;
      const value = src.grid[index];
      cells.push({
        row,
        column,
        solution: value,
        clueNumber: src.gridnums[index],
        initialState: value === "." ? "." : "",
        isBlocked: value === ".",
      });
    }
    result.push(cells);
  }

  return result;
}

function parseClues(clueStrings: string[], direction: PuzzleDirection, cells: Cell[][]) {
  const result: { [clueNumber: number]: Clue } = Object.create(null);

  const positionLookup: { [clueNumber: number]: CellPosition } = Object.create(null);
  for (let row = 0; cells.length; row++) {
    for (let col = 0; cells[row].length; col++) {
      const cell = cells[row][col];
      if (cell.clueNumber != null) {
        positionLookup[cell.clueNumber] = {
          row: cell.row,
          column: cell.column,
        };
      }
    }
  }

  for (const clueString of clueStrings) {
    const [clueNumberString, clue] = clueString.split(".", 2);
    const clueNumber = Number(clueNumberString);
    result[clueNumber] = {
      clue,
      clueNumber,
      direction,
      position: positionLookup[clueNumber],
    };
  }

  return result;
}
