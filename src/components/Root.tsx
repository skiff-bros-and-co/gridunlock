import { useRegisterSW } from "virtual:pwa-register/react";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseIntermediatePuzzle } from "../parsers/parseIntermediatePuzzle";
import { parseXWord } from "../parsers/parseXWord";
import type { PuzzleDefinition } from "../state/Puzzle";
import { generateMemorableToken } from "../utils/generateMemorableToken";
import { RoomSyncService } from "../web-rtc/RoomSyncService";
import { PuzzleView } from "./PuzzleView";

const ROOM_PATH_PREFIX = "/r/";

export function Root() {
  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      console.info("upgrading service worker in the background");
      updateServiceWorker(false);
    },
  });

  const roomName = useMemo(() => {
    const path = window.location.pathname;
    const hasRoom = path.startsWith(ROOM_PATH_PREFIX);
    const roomName = hasRoom && path.substring(ROOM_PATH_PREFIX.length);

    return !hasRoom || !roomName ? undefined : roomName;
  }, []);

  useEffect(() => {
    if (roomName != null) {
      return;
    }

    // Initialize Puzzle
    (async () => {
      const roomName = generateMemorableToken(32);
      const syncService = new RoomSyncService(roomName);

      const today = format(new Date(), "M-d-yyyy");
      const req = await fetch(`/api/puzzle/xword/${today}`);

      // const puzzleId = btoa("http://www.nytimes.com/specials/puzzles/classic.puz");
      // const req = await fetch(`/api/puzzle/puz/${puzzleId}`);

      await syncService.initPuzzle(parseIntermediatePuzzle(parseXWord(await req.json())));

      window.location.replace(ROOM_PATH_PREFIX + roomName);
    })();
  }, [roomName]);

  const syncService = useRef<RoomSyncService | undefined>(undefined);
  useEffect(() => {
    if (roomName == null) {
      throw new Error("roomName is somehow null");
    }

    if (roomName === syncService.current?.roomName) {
      return;
    }
    if (syncService.current != null) {
      throw new Error("syncService.current is somehow not null");
    }
    syncService.current = new RoomSyncService(roomName);
  }, [roomName]);

  const [puzzle, setPuzzle] = useState<PuzzleDefinition | undefined>(undefined);
  useEffect(() => {
    if (syncService.current == null) {
      return;
    }

    syncService.current.addEventListener("loaded", setPuzzle);

    return () => syncService.current!.removeEventListener("loaded", setPuzzle);
  }, []);

  useEffect(() => {
    const agent = window.navigator.userAgent.toLowerCase();
    const isWebKit = agent.includes("webkit") && !agent.includes("chrome");

    document.body.classList.toggle("-agent-webkit", isWebKit);
    document.body.classList.toggle("-touch-device", navigator.maxTouchPoints > 0);
  }, []);

  const isLoading = puzzle === undefined;
  useEffect(() => {
    const spinner = document.getElementById("loading-overlay");
    spinner?.classList.toggle("-loading", isLoading);
  }, [isLoading]);

  return <div className="root">{!isLoading && <PuzzleView puzzle={puzzle} syncService={syncService.current!} />}</div>;
}
