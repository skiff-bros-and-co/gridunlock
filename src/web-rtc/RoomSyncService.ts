import { pull } from "lodash-es";
import { IndexeddbPersistence, storeState } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { PuzzleDefinition } from "../state/Puzzle";
import { SyncedPuzzleCellState, SyncedPuzzleState } from "./types";

// This clearly provides no security other than mild obfustication.
const PASSWORD = "princess_untitled_hurled-skydiver_clothes_hazily";
const PUZZLE_DEF_KEY = "puzzleDef";

interface Events {
  cellsChanged: SyncedPuzzleState;
  loaded: PuzzleDefinition;
}
type EventHandler<E extends keyof Events> = (data: Events[E]) => void;
type EventHandlers = {
  [E in keyof Events]: EventHandler<E>[];
};

export class RoomSyncService {
  private listeners: EventHandlers = {
    cellsChanged: [],
    loaded: [],
  };

  private indexDbProvider: IndexeddbPersistence;
  private doc = new Y.Doc();
  private cells = this.doc.getArray<Y.Array<SyncedPuzzleCellState>>("cells");
  private info = this.doc.getMap<string | undefined>("info");
  private isLoaded = false;

  constructor(roomName: string) {
    new WebrtcProvider(roomName, this.doc, {
      password: PASSWORD,
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
          { cells: this.cells.toArray().map((row) => row.toArray()) },
          handler as EventHandler<"cellsChanged">,
        );
      }
      case "loaded": {
        if (!this.isLoaded) {
          return;
        }
        return this.emitWithData<"loaded">(
          event,
          JSON.parse(this.info.get(PUZZLE_DEF_KEY)!),
          handler as EventHandler<"loaded">,
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

  changeCell({ xIndex, yIndex, value }: { xIndex: number; yIndex: number; value: SyncedPuzzleCellState }) {
    this.doc.transact(() => {
      const row = this.cells.get(yIndex);
      row.delete(xIndex);
      row.insert(xIndex, [value]);
    });
  }

  async initPuzzle(puzzleDef: PuzzleDefinition) {
    const width = puzzleDef.width;
    const height = puzzleDef.height;

    this.doc.transact(() => {
      for (let y = 0; y < height; y++) {
        const row = new Y.Array<SyncedPuzzleCellState>();
        for (let x = 0; x < width; x++) {
          row.push([
            {
              value: "",
              writerUserId: undefined,
            },
          ]);
        }

        this.cells.push([row]);
      }

      this.info.set(PUZZLE_DEF_KEY, JSON.stringify(puzzleDef));
    });

    await this.indexDbProvider.whenSynced;
    await storeState(this.indexDbProvider, true);
  }
}
