import { PuzzleDefinition } from "../../../../src/state/Puzzle";

interface Env {
  // Defined in the Cloudflare Pages config
  XWORDS: KVNamespace;
}

interface PuzzleCacheEntry {
  puzzle: PuzzleDefinition;
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

    return new Response(body);
  } catch (e) {
    // There's no logging for Cloudflare Functions, yet :(
    return new Response(e?.stack ?? JSON.stringify(e), { status: 500 });
  }
};
