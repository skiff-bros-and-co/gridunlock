import { PuzzleDefinition } from "../../../../src/state/Puzzle";

interface Env {
  // Defined in the Cloudflare Pages config
  XWORDS: KVNamespace;
}

interface PuzzleCacheEntry {
  puzzle: PuzzleDefinition;
}

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
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const date = params.date as string;
    console.info("Got request for", date);

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
      return new Response();
    }

    return new Response(body);
  } catch (e) {
    // There's no logging for Cloudflare Functions, yet :(
    return new Response(e?.stack ?? JSON.stringify(e), { status: 500 });
  }
};
