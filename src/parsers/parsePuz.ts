import { CellClue, CellDefinition, Clue, PuzzleClues, PuzzleDefinition } from "../state/Puzzle";
import { buildCellCluesByRowAndColumn } from "../state/PuzzleDataBuilder";
import { SimpleBufferScanner } from "./SimpleBufferScanner";

function needsAcrossNumber(column: number, row: number, cells: CellDefinition[][]) {
  const cellsForRow = cells[row];
  const isStart = column === 0 || cellsForRow[column - 1].isBlocked;
  const hasNoAcross = column === cellsForRow.length - 1 || cellsForRow[column + 1].isBlocked;
  return isStart && !hasNoAcross;
}

function needsDownNumber(column: number, row: number, cells: CellDefinition[][]) {
  const isStart = row === 0 || cells[row - 1][column].isBlocked;
  const hasNoDown = row === cells.length - 1 || cells[row + 1][column].isBlocked;
  return isStart && !hasNoDown;
}

function indexClues(cells: CellDefinition[][], clueList: string[]): PuzzleClues {
  const acrossClues: { [clueNumber: number]: Clue } = {};
  const downClues: { [clueNumber: number]: Clue } = {};
  const cluesByRowAndColumn: (CellClue | undefined)[][] = [];

  let nextClueNumber = 1;
  let nextClueListIndex = 0;

  cells.forEach((row, rowIndex) => {
    cluesByRowAndColumn.push([]);

    row.forEach((cell, columnIndex) => {
      if (cell.isBlocked) {
        return;
      }

      if (needsAcrossNumber(columnIndex, rowIndex, cells)) {
        acrossClues[nextClueNumber] = {
          clue: clueList[nextClueListIndex],
          clueNumber: nextClueNumber,
          direction: "across",
          position: {
            row: rowIndex,
            column: columnIndex,
          },
        };
        cell.clueNumber = nextClueNumber;
        nextClueListIndex += 1;
      }

      if (needsDownNumber(columnIndex, rowIndex, cells)) {
        downClues[nextClueNumber] = {
          clue: clueList[nextClueListIndex],
          clueNumber: nextClueNumber,
          direction: "down",
          position: {
            row: rowIndex,
            column: columnIndex,
          },
        };
        cell.clueNumber = nextClueNumber;
        nextClueListIndex += 1;
      }

      if (cell.clueNumber != null) {
        nextClueNumber += 1;
      }
    });
  });

  return {
    across: acrossClues,
    down: downClues,
    byRowAndColumn: buildCellCluesByRowAndColumn(cells),
    clueCount: nextClueNumber - 1,
  };
}

function isNullCharacter(char: number) {
  return char === 0x00;
}

export function parsePuz(source: ArrayBuffer): PuzzleDefinition {
  /* see: https://code.google.com/archive/p/puz/wikis/FileFormat.wiki
   *
   * HEADER (0x34 bytes)
   * SOLUTION (cellCount bytes)
   * STATE (cellCount bytes)
   * TITLE (variable length, concluded with \0)
   * AUTHOR (variable length, concluded with \0)
   * COPYRIGHT (variable length, concluded with \0)
   * CLUES (A list of variable length strings, separated by \0. Contains clueCount items)
   * NOTES (variable length, concluded with \0)
   */

  const textDecoder = new TextDecoder("utf-8");
  const relevantHeaderOffset = 0x2c;
  const endOfHeader = 0x34;

  const scanner = new SimpleBufferScanner(source);

  scanner.moveTo(relevantHeaderOffset);
  const width = scanner.read(0x01).getInt8(0);
  const height = scanner.read(0x01).getInt8(0);
  const clueCount = scanner.read(0x02).getInt16(0, true);

  scanner.moveTo(endOfHeader);
  const cellCount = width * height;
  const solution = textDecoder.decode(scanner.read(cellCount));
  const state = textDecoder.decode(scanner.read(cellCount));

  const title = textDecoder.decode(scanner.readUntil(isNullCharacter)).trim();
  const author = textDecoder.decode(scanner.readUntil(isNullCharacter)).trim();
  const copyright = textDecoder.decode(scanner.readUntil(isNullCharacter)).trim();

  const clueList: string[] = [];
  for (let i = 0; i < clueCount; i++) {
    clueList.push(textDecoder.decode(scanner.readUntil(isNullCharacter)));
  }

  const notes = textDecoder.decode(scanner.readUntil(isNullCharacter));

  const cells: CellDefinition[][] = [];
  let currentCell = 0;
  for (let currentRow = 0; currentRow < height; currentRow++) {
    const row: CellDefinition[] = [];

    for (let currentColumn = 0; currentColumn < width; currentColumn++) {
      let cellState = state[currentCell].trim().toUpperCase();
      let cellSolution = solution[currentCell].trim().toUpperCase();

      if (cellState === "-") {
        cellState = "";
      }

      if (!cellState.match(/^[A-Z.]?$/)) {
        console.error(
          "Encountered unexpected state value while parsing puzzle",
          currentRow,
          currentColumn,
          cellState,
          title,
        );
        cellState = ".";
      }

      if (!cellSolution.match(/^[A-Z.]$/)) {
        console.error(
          "Encountered unexpected solution value while parsing puzzle",
          currentRow,
          currentColumn,
          cellSolution,
          title,
        );
        cellSolution = ".";
      }

      const cell: CellDefinition = {
        column: currentColumn,
        row: currentRow,
        solution: cellSolution,
        initialState: cellState,
        isBlocked: cellSolution === ".",
        clueNumber: undefined, // filled in by indexClues as needed
      };
      row.push(cell);
      currentCell += 1;
    }
    cells.push(row);
  }

  const clues = indexClues(cells, clueList);

  return {
    title,
    author,
    width: width,
    height: height,
    description: notes,
    copyright,
    clues,
    cells,
  };
}
