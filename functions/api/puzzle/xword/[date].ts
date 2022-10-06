import { XWordInfoJsonFormat } from "../../../../src/parsers/parseXWord";
import { differenceInCalendarDays, parse } from "date-fns";

const TIMEOUTS_SEC = {
  UNAVAILABLE_KV: 1 * 60 * 60,
  AVAILABLE_CACHE_HEADER: 4 * 60 * 60,
};

const MAX_DAYS_AGO = 7;

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
  const date = (params.date as string).replace("-", "/");
  try {
    const puzzleString = await fetchPuzzle(date, env);
    const available: PuzzleCacheEntry = { available: true, puzzleString };
    env.XWORDS.put(date, JSON.stringify(available));

    return new Response(puzzleString, {
      headers: {
        "cache-control": `public, max-age=${TIMEOUTS_SEC.AVAILABLE_CACHE_HEADER}`,
      },
    });
  } catch (e) {
    const unavailable: PuzzleCacheEntry = { available: false };
    env.XWORDS.put(date, JSON.stringify(unavailable), {
      expirationTtl: TIMEOUTS_SEC.UNAVAILABLE_KV,
    });

    throw e;
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

  const now = new Date();
  const dateParsed = parse(date, "M/d/yyyy", now);
  const howManyDaysAgo = differenceInCalendarDays(now, dateParsed);
  if (howManyDaysAgo < -1) {
    throw new Error("We cannot time travel");
  }
  if (howManyDaysAgo > MAX_DAYS_AGO) {
    throw new Error("Requested a puzzle from too long ago");
  }

  const req = await fetch(`https://www.xwordinfo.com/JSON/Data.ashx?format=text&date=${date}`, {
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
