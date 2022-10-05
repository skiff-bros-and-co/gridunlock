import { parsePuz } from "../../../src/parsers/parsePuz";

export const onRequestGet: PagesFunction = async ({ request, params }) => {
  const base64url = params.base64url as string;
  const url = atob(base64url);

  console.info("Got request for", url);

  const puzzleData = await getPuzzle(url);
  const puzzle = await parsePuz(puzzleData);
  const response = new Response(JSON.stringify(puzzle));

  caches.default.put(request, response);

  return response;
};

async function getPuzzle(url: string) {
  return (await fetch(url)).arrayBuffer();
}
