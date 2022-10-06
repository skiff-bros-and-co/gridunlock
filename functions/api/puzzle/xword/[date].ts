import { XWordInfoJsonFormat } from "../../../../src/parsers/parseXWord";

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
  puzzleString: string;
}

interface PuzzleCacheEntryUnavailable {
  available: false;
}

type PuzzleCacheEntry = PuzzleCacheEntryAvailable | PuzzleCacheEntryUnavailable;

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const date = params.date as string;

  throw new Error("test");

  try {
    const puzzleString = await fetchPuzzle(date, env);
    const available: PuzzleCacheEntry = { available: true, puzzleString };
    env.XWORDS.put(date, JSON.stringify(available));

    return new Response(puzzleString);
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

    return existing.puzzleString;
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

  return body;
}
