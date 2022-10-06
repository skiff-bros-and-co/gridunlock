import { Cell, Clue, PuzzleDefinition, PuzzleDirection, CellPosition } from "../../../../src/state/Puzzle";
import { buildCellCluesByRowAndColumn } from "../../../../src/state/PuzzleDataBuilder";

const TIMEOUTS_SEC = {
  UNAVAILABLE_KV: 1 * 60 * 60,
  UNAVAILABLE_CACHE_HEADER: 1 * 60 * 60,
  AVAILABLE_CACHE_HEADER: 4 * 60 * 60,
};

interface Env {
  // Defined in the Cloudflare Pages config
  XWORDS: KVNamespace;
}

interface PuzzleCacheEntryAvailable {
  available: true;
  puzzle: PuzzleDefinition;
}

interface PuzzleCacheEntryUnavailable {
  available: false;
}

type PuzzleCacheEntry = PuzzleCacheEntryAvailable | PuzzleCacheEntryUnavailable;

// see: https://www.xwordinfo.com/JSON/
interface XWordInfoJsonFormat {
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

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const date = params.date as string;
  console.info("Got request for", date);

  try {
    const puzzle = await fetchPuzzle(date, env);
    const available: PuzzleCacheEntry = { available: true, puzzle };
    env.XWORDS.put(date, JSON.stringify(available));

    return new Response(JSON.stringify(puzzle), {
      headers: {
        "cache-control": `public, max-age=${TIMEOUTS_SEC.AVAILABLE_CACHE_HEADER}`,
      },
    });
  } catch (e) {
    console.error("failed to fetch puzzle", e?.stack ?? e);
    const unavailable: PuzzleCacheEntry = { available: false };
    env.XWORDS.put(date, JSON.stringify(unavailable), {
      expirationTtl: TIMEOUTS_SEC.UNAVAILABLE_KV,
    });

    return new Response("Failed to retrieve puzzle", {
      status: 500,
      headers: {
        "cache-control": `public, max-age=${TIMEOUTS_SEC.UNAVAILABLE_CACHE_HEADER}`,
      },
    });
  }
};

export async function fetchPuzzle(date: string, env: Env) {
  const existing = await env.XWORDS.get<PuzzleCacheEntry>(date, "json");
  if (existing != null) {
    if (!existing.available) {
      throw new Error("puzzle still isn't available");
    }

    return existing.puzzle;
  }

  const req = await fetch(`https://www.xwordinfo.com/JSON/Data.ashx?format=text&date=${date.replace("-", "/")}`, {
    headers: {
      referer: "https://www.xwordinfo.com/JSON/Sample2",
    },
  });

  const body = await req.text();
  if (body == null || body.trim().length === 0) {
    throw new Error("Somehow failed to get puzzle");
  }

  const parsed: XWordInfoJsonFormat = JSON.parse(body);

  // Puzzles too far into the future have null values.
  if (parsed.title == null) {
    throw new Error("puzzle isn't yet available");
  }

  const cells = generateCells(parsed);
  const maxClueNumber = Math.max(
    ...cells.flatMap((row) => row.map((cell) => cell.clueNumber)).filter((clueNumber) => clueNumber != null),
  );
  const puzzle: PuzzleDefinition = {
    title: parsed.title,
    author: parsed.author,
    copyright: parsed.copyright,
    description: parsed.notepad,
    height: parsed.size.rows,
    width: parsed.size.cols,
    cells,
    clues: {
      across: parseClues(parsed.clues.across, "across", cells),
      byRowAndColumn: buildCellCluesByRowAndColumn(cells),
      clueCount: maxClueNumber,
      down: parseClues(parsed.clues.down, "down", cells),
    },
  };
  return puzzle;
}

function generateCells(src: XWordInfoJsonFormat): Cell[][] {
  const result: Cell[][] = [];

  // grid is a flattened, row major array
  for (let row = 0; src.size.rows; row++) {
    const cells: Cell[] = [];
    for (let col = 0; src.size.cols; col++) {
      const index = row * src.size.cols + col;
      const value = src.grid[index];
      cells.push({
        column: col,
        row,
        initialState: value === "." ? "." : "",
        isBlocked: value === ".",
        solution: value,
        clueNumber: src.gridnums[index],
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
