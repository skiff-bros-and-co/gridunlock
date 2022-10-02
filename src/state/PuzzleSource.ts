export type PuzzleSourceID = string & { ___TOKEN: "puzzle-source-id" };
export function castPuzzleSourceID(id: string): PuzzleSourceID {
  return id as PuzzleSourceID;
}

export interface PuzzleSource {
  id: PuzzleSourceID;
  title: string;
}
