import { parsePuz } from "../../../src/parsers/parsePuz";

const MAX_PUZZLE_BYTES = 100 * 1024;

export const onRequestGet: PagesFunction = async ({ request, params }) => {
  try {
    const base64url = params.base64url as string;
    const url = atob(base64url);

    console.info("Got request for", url);

    const puzzleData = await getPuzzle(url);
    if (puzzleData.byteLength > MAX_PUZZLE_BYTES) {
      return new Response("Puzzle too large", { status: 400 });
    }

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
