import { pull, sortBy, startCase } from "lodash-es";
import SimplePeer from "simple-peer";
import { IndexeddbPersistence, storeState } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { CellPosition, PuzzleDefinition } from "../state/Puzzle";
import { generateMemorableToken } from "../utils/generateMemorableToken";
import { ModifiedRTCPeerConnection } from "./ModifiedRTCPeerConnection";
import { SyncedPlayerInfo, SyncedPlayerState, SyncedPuzzleCellState, SyncedPuzzleState } from "./types";

// This clearly provides no security other than mild obfustication.
const PASSWORD = "princess_untitled_hurled-skydiver_clothes_hazily";
const PUZZLE_DEF_KEY = "puzzleDef";

const cellKey = (cell: CellPosition) => `${cell.column}:${cell.row}`;

interface Events {
  cellsChanged: SyncedPuzzleState;
  loaded: PuzzleDefinition;
  playersStateChanged: SyncedPlayerState[];
}
type EventHandler<E extends keyof Events> = (data: Events[E]) => void;
type EventHandlers = {
  [E in keyof Events]: EventHandler<E>[];
};

export class RoomSyncService {
  private listeners: EventHandlers = {
    cellsChanged: [],
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
    const peerOpts: SimplePeer.Options = {
      wrtc: {
        RTCIceCandidate,
        RTCSessionDescription,
        RTCPeerConnection: ModifiedRTCPeerConnection,
      },
    };

    this.webrtcProvider = new WebrtcProvider(roomName, this.doc, {
      password: PASSWORD,
      peerOpts,
      // The types are BAD
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    this.indexDbProvider = new IndexeddbPersistence("room-" + roomName, this.doc);

    this.cells.observeDeep(() => {
      this.emit("cellsChanged");
    });
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
      case "cellsChanged": {
        return this.emitWithData<"cellsChanged">(
          event,
          { cells: this.readCells() },
          handler as EventHandler<"cellsChanged">,
        );
      }
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

  changeCell({ position, value }: { position: CellPosition; value: SyncedPuzzleCellState }) {
    this.cells.set(cellKey(position), value);
  }

  async initPuzzle(puzzleDef: PuzzleDefinition) {
    const width = puzzleDef.width;
    const height = puzzleDef.height;

    this.doc.transact(() => {
      for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
          this.cells.set(cellKey({ row, column }), { value: "" });
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

  private readPuzzleDef(): PuzzleDefinition | undefined {
    const puzzleDef = this.info.get(PUZZLE_DEF_KEY);
    if (puzzleDef == null) {
      return undefined;
    }
    return JSON.parse(puzzleDef);
  }

  private readCells() {
    const puzzleDef = this.readPuzzleDef()!;

    const result: SyncedPuzzleCellState[][] = [];
    for (let row = 0; row < puzzleDef.height; row++) {
      const resultRow: SyncedPuzzleCellState[] = [];
      for (let column = 0; column < puzzleDef.width; column++) {
        resultRow.push(this.cells.get(cellKey({ row, column }))!);
      }
      result.push(resultRow);
    }
    return result;
  }
}
