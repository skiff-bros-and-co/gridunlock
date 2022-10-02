import { castPuzzleSourceID, PuzzleSource } from "./PuzzleSource";
import { Puzzle, SingleLetter, CellPosition, PuzzleDirection } from "./Puzzle";

export type UserID = string & { ___TOKEN: "user-id" };
export function castUserID(id: string): UserID {
  return id as UserID;
}

export interface PuzzleGameCell {
  filledValue: SingleLetter | "";
  author: UserID | null;
  isBlocked: boolean;
}

export type PuzzleState = PuzzleGameCell[][];

export interface PuzzleGame {
  puzzleDefinition: Puzzle;
  puzzleState: PuzzleState;
}

export interface PuzzlePageState {
  inputDirection: PuzzleDirection;
  focusedCell: null | CellPosition;
}

export interface ActivePuzzleGame {
  game: null | PuzzleGame;

  // puzzleId: PuzzleID;
}

// export class PuzzleID {
//   public static from(source: PuzzleSource, date: DateTime) {
//     return new PuzzleID(source, date.startOf("day"));
//   }

//   private constructor(
//     public source: PuzzleSource,
//     public date: DateTime,
//   ) { }
// }

export function createEmptyPuzzleGame(puzzle: Puzzle): PuzzleGame {
  const rows: PuzzleGameCell[][] = [];
  for (let i = 0; i < puzzle.height; i++) {
    const row: PuzzleGameCell[] = [];
    for (let j = 0; j < puzzle.width; j++) {
      row.push({
        filledValue: "",
        author: null,
      });
    }
    rows.push(row);
  }
  return {
    filledCellsByRow: rows,
    puzzleDefinition: puzzle,
  };
}

export type Page = "puzzle" | "main-menu";

export interface AppState {
  activePuzzleGame: null | ActivePuzzleGame;

  puzzlePage: PuzzlePageState;

  user: UserID;
  sources: PuzzleSource[];

  currentPage: Page;
}

export const initialAppState: AppState = {
  activePuzzleGame: null,
  user: castUserID("user1"),

  puzzlePage: {
    focusedCell: null,
    inputDirection: "across",
  },

  sources: [
    {
      title: "Jonesin",
      id: castPuzzleSourceID("jonesin"),
      // uriTemplate: (date) => `http://herbach.dnsalias.com/Jonesin/jz${date.toFormat("YYMMDD")}.puz`,
      // recurrence: () => ({
      //   frequency: "WEEKLY",
      //   byDayOfWeek: ["TH"],
      //   start: DateTime.local(2010, 1, 1), // TODO: Figure out a reasonable start date
      // }),
    },
    {
      title: "New York Times Classics",
      id: castPuzzleSourceID("nyt-classics"),
      // uriTemplate: () => "http://www.nytimes.com/specials/puzzles/classic.puz",
      // recurrence: () => ({
      //   frequency: "DAILY", // TODO: What time of day do the new puzzles go up?
      //   start: DateTime.local().startOf("day"), // TODO: is this the right way to restrict to only the last day?
      // }),
    },
  ],

  currentPage: "main-menu",
};
