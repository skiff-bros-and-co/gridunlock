import { unescape } from "lodash-es";
import type { IntermediatePuzzleDefinition } from "./types";

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

export function parseXWord(src: XWordInfoJsonFormat): IntermediatePuzzleDefinition {
  return {
    title: src.title,
    author: src.author,
    copyright: src.copyright,
    description: src.notepad ?? "",
    height: src.size.rows,
    width: src.size.cols,
    cells: build2DArray(src.size.cols, src.size.rows, src.grid),
    clues: {
      across: parseClues(src.clues.across),
      down: parseClues(src.clues.down),
      byCell: build2DArray(src.size.cols, src.size.rows, src.gridnums).map((row) =>
        row.map((cell) => (cell === 0 ? undefined : cell)),
      ),
    },
  };
}

function build2DArray<T>(width: number, height: number, src: T[]): T[][] {
  const result: T[][] = [];
  for (let row = 0; row < height; row++) {
    const cells: T[] = [];
    for (let column = 0; column < width; column++) {
      const index = row * width + column;
      cells.push(src[index]);
    }
    result.push(cells);
  }
  return result;
}

function parseClues(clueList: string[]): { [clueNumber: number]: string } {
  const result: { [clueNumber: number]: string } = Object.create(null);

  for (const clueString of clueList) {
    const [clueNumberString, ...clue] = clueString.split(".");
    const clueNumber = Number(clueNumberString);
    result[clueNumber] = unescape(clue.join(".").trim());
  }

  return result;
}
