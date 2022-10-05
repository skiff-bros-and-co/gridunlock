import { pull } from "lodash-es";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { SyncedPuzzleCellState, SyncedPuzzleState, SyncedRoomInfo } from "./types";

// This clearly provides no security other than mild obfustication.
const PASSWORD = "princess_untitled_hurled-skydiver_clothes_hazily";

interface Events {
  cellsChanged: SyncedPuzzleState;
  infoChanged: SyncedRoomInfo;
}
type EventHandler<E extends keyof Events> = (data: Events[E]) => void;
type EventHandlers = {
  [E in keyof Events]: EventHandler<E>[];
};

export class RoomSyncService {
  private listeners: EventHandlers = {
    cellsChanged: [],
    infoChanged: [],
  };

  private doc = new Y.Doc();
  private cells = this.doc.getArray<Y.Array<SyncedPuzzleCellState>>("cells");
  private info = this.doc.getMap<string | undefined>("info"); // SyncedRoomInfo

  constructor(roomName: string) {
    new WebrtcProvider(roomName, this.doc, {
      password: PASSWORD,
      // The types are BAD
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    this.cells.observeDeep(() => {
      this.emit("cellsChanged");
    });
    this.info.observeDeep(() => {
      this.emit("infoChanged");
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
      case "cellsChanged":
        return this.emitWithData<"cellsChanged">(
          event,
          { cells: this.cells.toArray().map((row) => row.toArray()) },
          handler as EventHandler<"cellsChanged">,
        );
      case "infoChanged":
        return this.emitWithData<"infoChanged">(
          event,
          { puzzleUrl: this.info.get("puzzleUrl") },
          handler as EventHandler<"infoChanged">,
        );
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

  initPuzzle({ width, height }: { width: number; height: number }) {
    this.doc.transact(() => {
      if (this.cells.length > 0) {
        return;
      }

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
    });
  }

  setInfo(info: SyncedRoomInfo) {
    this.info.set("puzzleUrl", info.puzzleUrl);
  }
}
