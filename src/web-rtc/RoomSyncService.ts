import { pull, sortBy, startCase } from "lodash-es";
import * as SimplePeer from "simple-peer";
import { IndexeddbPersistence, storeState } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { CellPosition, PuzzleDefinition } from "../state/Puzzle";
import { generateMemorableToken } from "../utils/generateMemorableToken";
import { CellValidState } from "../utils/validatePuzzleState";
import { createWebRtcProvider } from "./createWebRtcProvider";
import { IceApiResponse, SyncedPlayerInfo, SyncedPlayerState, SyncedPuzzleCellState } from "./types";

const PUZZLE_DEF_KEY = "puzzleDef";
const DEFAULT_ICE_SERVER_URLS = ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"];

export const getSyncedCellKey = (cell: CellPosition) => `${cell.column}:${cell.row}`;

interface Events {
  loaded: PuzzleDefinition;
  playersStateChanged: SyncedPlayerState[];
}
type EventHandler<E extends keyof Events> = (data: Events[E]) => void;
type EventHandlers = {
  [E in keyof Events]: EventHandler<E>[];
};

export class RoomSyncService {
  private listeners: EventHandlers = {
    loaded: [],
    playersStateChanged: [],
  };

  private indexDbProvider: IndexeddbPersistence;
  private webrtcProvider: WebrtcProvider;
  private doc = new Y.Doc();
  private cells = this.doc.getMap<SyncedPuzzleCellState>("cells");
  private info = this.doc.getMap<string | undefined>("info");
  private isLoaded = false;
  private playerInfo: SyncedPlayerInfo = {
    name: startCase(generateMemorableToken(24, " ")),
    joinTimeUtcMs: Date.now(),
    clientID: this.doc.clientID,
  };

  constructor(roomName: string) {
    this.webrtcProvider = createWebRtcProvider({
      doc: this.doc,
      roomName,
      iceServers: [
        {
          urls: DEFAULT_ICE_SERVER_URLS,
        },
      ],
    });
    this.indexDbProvider = new IndexeddbPersistence("room-" + roomName, this.doc);

    this.info.observeDeep(() => {
      if (this.isLoaded === false && this.info.get(PUZZLE_DEF_KEY) != null) {
        this.isLoaded = true;
        this.emit("loaded");
      }
    });
    this.webrtcProvider.awareness.on("change", () => {
      this.emit("playersStateChanged");
    });

    this.updatePlayerPosition();
    this.lazyAddTurnIceServers();
  }

  addEventListener<E extends keyof Events>(event: E, handler: EventHandler<E>) {
    this.listeners[event].push(handler);
    this.emit(event, handler);
  }

  removeEventListener<E extends keyof Events>(event: E, handler: EventHandler<E>) {
    pull(this.listeners[event], handler);
  }

  private emit<E extends keyof Events & string>(event: E, handler?: EventHandler<E>) {
    switch (event) {
      case "loaded": {
        if (!this.isLoaded) {
          return;
        }
        return this.emitWithData<"loaded">(event, this.readPuzzleDef()!, handler as EventHandler<"loaded">);
      }
      case "playersStateChanged": {
        this.emitWithData<"playersStateChanged">(
          event,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sortBy(
            Array.from(this.webrtcProvider.awareness.getStates().values()) as SyncedPlayerState[],
            (player) => player.info.joinTimeUtcMs,
          ),
          handler as EventHandler<"playersStateChanged">,
        );
      }
    }
  }

  private emitWithData<E extends keyof Events>(event: E, data: Events[E], handler?: EventHandler<E>) {
    if (handler !== undefined) {
      handler(data);
    } else {
      this.listeners[event].forEach((l) => l(data));
    }
  }

  markInvalidCells(validation: CellValidState[][]) {
    this.doc.transact(() => {
      for (let row = 0; row < validation.length; row++) {
        for (let column = 0; column < validation[row].length; column++) {
          const key = getSyncedCellKey({ row, column });
          const prev = this.cells.get(key)!;
          this.cells.set(key, {
            ...prev,
            isMarkedIncorrect: validation[row][column] === "incorrect",
          });
        }
      }
    });
  }

  async initPuzzle(puzzleDef: PuzzleDefinition) {
    const width = puzzleDef.width;
    const height = puzzleDef.height;

    this.doc.transact(() => {
      for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
          this.cells.set(getSyncedCellKey({ row, column }), { value: "", isMarkedIncorrect: false });
        }
      }

      this.info.set(PUZZLE_DEF_KEY, JSON.stringify(puzzleDef));
    });

    await this.indexDbProvider.whenSynced;
    await storeState(this.indexDbProvider, true);
  }

  updatePlayerPosition(position?: CellPosition) {
    const state: SyncedPlayerState = {
      info: this.playerInfo,
      position,
    };
    this.webrtcProvider.awareness.setLocalState(state);
  }

  get clientID() {
    return this.doc.clientID;
  }

  get syncedPuzzleState() {
    return this.cells;
  }

  private readPuzzleDef(): PuzzleDefinition | undefined {
    const puzzleDef = this.info.get(PUZZLE_DEF_KEY);
    if (puzzleDef == null) {
      return undefined;
    }
    return JSON.parse(puzzleDef);
  }

  private async lazyAddTurnIceServers() {
    const iceInfo: IceApiResponse = await (await fetch("/api/rtc/ice")).json();

    const opts = this.webrtcProvider.peerOpts as SimplePeer.Options;
    opts.config!.iceServers!.push(...iceInfo.iceServers);
    this.webrtcProvider.connect();
  }
}
