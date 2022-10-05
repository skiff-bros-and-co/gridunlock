import { useEffect, useMemo, useState } from "react";
import { Header } from "./Header";
import { RoomSyncService } from "../web-rtc/RoomSyncService";
import { PuzzleView } from "./PuzzleView";
import { PuzzleDefinition } from "../state/Puzzle";

export function Root({ roomName }: { roomName: string }) {
  const syncService = useMemo(() => new RoomSyncService(roomName), [roomName]);

  const [puzzleDef, setPuzzleDef] = useState<PuzzleDefinition | undefined>(undefined);
  useEffect(() => {
    const puzzleId = btoa("http://www.nytimes.com/specials/puzzles/classic.puz");
    (async () => {
      const req = await fetch(`/api/puzzle/${puzzleId}`);
      setPuzzleDef(await req.json());
    })();
  }, [setPuzzleDef]);

  if (puzzleDef === undefined) {
    return (
      <div className="root">
        <Header />
      </div>
    );
  }

  return (
    <div className="root">
      <Header />
      <PuzzleView puzzleDefinition={puzzleDef} syncService={syncService}></PuzzleView>
    </div>
  );
}
