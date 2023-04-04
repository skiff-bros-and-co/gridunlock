import { unescape } from "lodash-es";
import { CellDefinition, CellPosition, Clue, FillDirection, PuzzleDefinition } from "../state/Puzzle";
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
  circles: number[] | null;
  clues: {
    across: string[];
    down: string[];
  };
  notepad: string | null;
}

export function parseXWord(src: XWordInfoJsonFormat): PuzzleDefinition {
  const cells = generateCells(src);
  const maxClueNumber = Math.max(
    ...(cells
      .flatMap((row) => row.map((cell) => cell.clueNumber))
      .filter((clueNumber) => clueNumber != null) as number[]),
  );
  return {
    title: src.title,
    author: src.author,
    copyright: src.copyright,
    description: src.notepad ?? "",
    height: src.size.rows,
    width: src.size.cols,
    cells,
    clues: {
      across: parseClues(src.clues.across, "across", cells),
      byRowAndColumn: buildCellCluesByRowAndColumn(cells),
      clueCount: maxClueNumber,
      down: parseClues(src.clues.down, "down", cells),
    },
  };
}

function generateCells(src: XWordInfoJsonFormat): CellDefinition[][] {
  const result: CellDefinition[][] = [];

  // grid is a flattened, row major array
  for (let row = 0; row < src.size.rows; row++) {
    const cells: CellDefinition[] = [];
    for (let column = 0; column < src.size.cols; column++) {
      const index = row * src.size.cols + column;
      const value = src.grid[index];
      cells.push({
        row,
        column,
        solution: value,
        clueNumber: src.gridnums[index] === 0 ? undefined : src.gridnums[index],
        initialState: value === "." ? "." : "",
        isBlocked: value === ".",
      });
    }
    result.push(cells);
  }

  return result;
}

function parseClues(clueStrings: string[], direction: FillDirection, cells: CellDefinition[][]) {
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

  for (const clueString of clueStrings) {
    const [clueNumberString, ...clue] = clueString.split(".");
    const clueNumber = Number(clueNumberString);
    result[clueNumber] = {
      clue: unescape(clue.join(".").trim()),
      clueNumber,
      direction,
      position: positionLookup[clueNumber],
    };
  }

  return result;
}
