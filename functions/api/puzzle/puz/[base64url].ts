import { parsePuz } from "../../../../src/parsers/parsePuz";
import type { IntermediatePuzzleDefinition } from "../../../../src/parsers/types";

interface Env {
  // Defined in the Cloudflare Pages config
  PUZZLES: KVNamespace;
}

interface PuzzleCacheEntry {
  puzzle: IntermediatePuzzleDefinition;
}

const MAX_PUZZLE_BYTES = 100 * 1024;

// Why so short?
// Puzzle URLs are often reused across days.
// (e.g. the NY times daily classic is always the same url).
const PUZZLE_TTL_SEC = 1 * 60 * 60;

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const base64url = params.base64url as string;
    const url = atob(base64url);

    console.info("Got request for", url);

    const puzzle = await getPuzzle(url, env);
    return new Response(JSON.stringify(puzzle));
  } catch (e) {
    // There's no logging for Cloudflare Functions, yet :(
    return new Response(e?.stack ?? JSON.stringify(e), { status: 500 });
  }
};

async function getPuzzle(url: string, env: Env): Promise<IntermediatePuzzleDefinition> {
  const cached = await env.PUZZLES.get<PuzzleCacheEntry | undefined>(url, "json");
  if (cached != null) {
    return cached.puzzle;
  }

  const puzzleData = await (await fetch(url)).arrayBuffer();
  if (puzzleData.byteLength > MAX_PUZZLE_BYTES) {
    throw new Error(`Puzzle too large (${puzzleData.byteLength})`);
  }

  const puzzle = await parsePuz(puzzleData);

  const toCache: PuzzleCacheEntry = {
    puzzle,
  };
  await env.PUZZLES.put(url, JSON.stringify(toCache), {
    expirationTtl: PUZZLE_TTL_SEC,
  });

  return puzzle;
}
