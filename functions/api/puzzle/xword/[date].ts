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

    const req = await fetch(
      "https://www.xwordinfo.com/JSON/Data.ashx?callback=jQuery3610038867805517661_1665020930216&date=current&_=1665020930217",
      {
        headers: {
          "authority": "www.xwordinfo.com",
          "accept":
            "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "max-age=0",
          "cookie":
            "ASP.NET_SessionId=gboq20agl4ninrrh1zphhex5; _gid=GA1.2.611739922.1665013855; __gads=ID=58bea5a7a870da0a-223467d093d700bb:T=1665015460:RT=1665015460:S=ALNI_MY8SUNh-haTim0qIbYhC4P1yn6ePw; __gpi=UID=0000087b2d606837:T=1665015460:RT=1665015460:S=ALNI_Mbr31WqyshbzyOxmH3iS6lszkaKmg; _ga=GA1.2.1033778194.1665013855; _ga_4N9YZGECSH=GS1.1.1665013855.1.1.1665017235.0.0.0",
          "referrer": "https://www.xwordinfo.com/JSON/Sample2",
          "sec-ch-ua": '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
          "x-requested-with": "XMLHttpRequest",
        },
        cf: {
          scrapeShield: false,
        },
      },
    );

    const body = await req.text();

    return new Response(body);
  } catch (e) {
    // There's no logging for Cloudflare Functions, yet :(
    return new Response(e?.stack ?? JSON.stringify(e), { status: 500 });
  }
};
