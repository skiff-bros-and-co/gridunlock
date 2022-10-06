import { PuzzleDefinition } from "../../../../src/state/Puzzle";

interface Env {
  // Defined in the Cloudflare Pages config
  XWORD: KVNamespace;
}

interface PuzzleCacheEntry {
  puzzle: PuzzleDefinition;
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const date = params.date as string;
    console.info("Got request for", date);

    const req = await fetch("https://www.xwordinfo.com/JSON/Data.ashx?format=text", {
      headers: {
        "accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "referrer": "https://www.xwordinfo.com/JSON/",
        "sec-ch-ua": '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
      },
    });

    const body = await req.text();

    return new Response(body);
  } catch (e) {
    // There's no logging for Cloudflare Functions, yet :(
    return new Response(e?.stack ?? JSON.stringify(e), { status: 500 });
  }
};
