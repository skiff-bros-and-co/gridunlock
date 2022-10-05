import { parsePuz } from "../../../src/parsers/parsePuz";

export const onRequestGet: PagesFunction = async ({ request, params }) => {
  try {
    const base64url = params.base64url as string;
    const url = atob(base64url);

    console.info("Got request for", url);

    const puzzleData = await getPuzzle(url);
    const puzzle = await parsePuz(puzzleData);
    const response = new Response(JSON.stringify(puzzle));

    return response;
  } catch (e) {
    return new Response(e?.stack ?? e, { status: 500 });
  }
};

async function getPuzzle(url: string) {
  return (await fetch(url)).arrayBuffer();
}
