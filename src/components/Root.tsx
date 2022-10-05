import { useMemo } from "react";
import { testPuzzleData } from "../state/TestData";
import { Header } from "./Header";
import { RoomSyncService } from "../web-rtc/RoomSyncService";
import { PuzzleView } from "./PuzzleView";

export function Root({ roomName }: { roomName: string }) {
  const syncService = useMemo(() => new RoomSyncService(roomName), [roomName]);

  return (
    <div className="root">
      <Header />
      <PuzzleView puzzleDefinition={testPuzzleData} syncService={syncService}></PuzzleView>
    </div>
  );
}
