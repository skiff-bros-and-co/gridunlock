import { Spinner } from "@blueprintjs/core";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { parseXWord } from "../parsers/parseXWord";
import { PuzzleDefinition } from "../state/Puzzle";
import { RoomSyncService } from "../web-rtc/RoomSyncService";
import { Header } from "./Header";
import { PuzzleView } from "./PuzzleView";

export function Root({ roomName }: { roomName: string }) {
  const syncService = useMemo(() => new RoomSyncService(roomName), [roomName]);

  const [puzzleDef, setPuzzleDef] = useState<PuzzleDefinition | undefined>(undefined);
  useEffect(() => {
    const today = format(new Date(), "M-d-yyyy");
    (async () => {
      const req = await fetch(`/api/puzzle/xword/${today}`);
      setPuzzleDef(parseXWord(await req.json()));
    })();

    // const puzzleId = btoa("http://www.nytimes.com/specials/puzzles/classic.puz");
    // (async () => {
    //   const req = await fetch(`/api/puzzle/puz/${puzzleId}`);
    //   setPuzzleDef(await req.json());
    // })();
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
