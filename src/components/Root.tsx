import { useEffect, useMemo, useState } from "react";
import { Header } from "./Header";
import { RoomSyncService } from "../web-rtc/RoomSyncService";
import { PuzzleView } from "./PuzzleView";
import { PuzzleDefinition } from "../state/Puzzle";
import { Spinner } from "@blueprintjs/core";

export function Root({ roomName }: { roomName: string }) {
  const syncService = useMemo(() => new RoomSyncService(roomName), [roomName]);

  const [puzzleDef, setPuzzleDef] = useState<PuzzleDefinition | undefined>(undefined);
  useEffect(() => {
    const puzzleId = btoa("http://www.nytimes.com/specials/puzzles/classic.puz");
    (async () => {
      const req = await fetch(`/api/puzzle/puz/${puzzleId}`);
      setPuzzleDef(await req.json());
    })();
  }, [setPuzzleDef]);

  const isLoading = puzzleDef === undefined;
  return (
    <div className="root">
      <Header />
      {!isLoading && <PuzzleView puzzleDefinition={puzzleDef} syncService={syncService}></PuzzleView>}
      <div className={"loading-overlay " + (isLoading ? "loading" : "")}>
        <Spinner />
      </div>
    </div>
  );
}
