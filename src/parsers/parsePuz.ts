import { SimpleBufferScanner } from "./SimpleBufferScanner";
import type { IntermediatePuzzleClues, IntermediatePuzzleDefinition } from "./types";

function needsAcrossNumber(column: number, row: number, cells: string[][]) {
  const cellsForRow = cells[row];
  const isStart = column === 0 || cellsForRow[column - 1] === ".";
  const hasNoAcross = column === cellsForRow.length - 1 || cellsForRow[column + 1] === ".";
  return isStart && !hasNoAcross;
}

function needsDownNumber(column: number, row: number, cells: string[][]) {
  const isStart = row === 0 || cells[row - 1][column] === ".";
  const hasNoDown = row === cells.length - 1 || cells[row + 1][column] === ".";
  return isStart && !hasNoDown;
}

function indexClues(cells: string[][], clueList: string[]): IntermediatePuzzleClues {
  const acrossClues: { [clueNumber: number]: string } = {};
  const downClues: { [clueNumber: number]: string } = {};
  const clueNumbersByCell: (number | undefined)[][] = [];

  let nextClueNumber = 1;
  let nextClueListIndex = 0;

  cells.forEach((row, rowIndex) => {
    const clueNumbersForRow: (number | undefined)[] = [];

    row.forEach((cell, columnIndex) => {
      if (cell === ".") {
        clueNumbersForRow.push(undefined);
        return;
      }

      let clueNumber: number | undefined;

      if (needsAcrossNumber(columnIndex, rowIndex, cells)) {
        acrossClues[nextClueNumber] = clueList[nextClueListIndex];
        clueNumber = nextClueNumber;
        nextClueListIndex += 1;
      }

      if (needsDownNumber(columnIndex, rowIndex, cells)) {
        downClues[nextClueNumber] = clueList[nextClueListIndex];
        clueNumber = nextClueNumber;
        nextClueListIndex += 1;
      }

      if (clueNumber != null) {
        nextClueNumber += 1;
      }

      clueNumbersForRow.push(clueNumber);
    });

    clueNumbersByCell.push(clueNumbersForRow);
  });

  return {
    across: acrossClues,
    down: downClues,
    byCell: clueNumbersByCell,
  };
}

function isNullCharacter(char: number) {
  return char === 0x00;
}

export function parsePuz(source: ArrayBuffer): IntermediatePuzzleDefinition {
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
  scanner.read(cellCount); // The state is not used

  const title = textDecoder.decode(scanner.readUntil(isNullCharacter)).trim();
  const author = textDecoder.decode(scanner.readUntil(isNullCharacter)).trim();
  const copyright = textDecoder.decode(scanner.readUntil(isNullCharacter)).trim();

  const clueList: string[] = [];
  for (let i = 0; i < clueCount; i++) {
    clueList.push(textDecoder.decode(scanner.readUntil(isNullCharacter)));
  }

  const notes = textDecoder.decode(scanner.readUntil(isNullCharacter));

  const cells: string[][] = [];
  let currentCell = 0;
  for (let currentRow = 0; currentRow < height; currentRow++) {
    const row = [];

    for (let currentColumn = 0; currentColumn < width; currentColumn++) {
      let cellSolution = solution[currentCell].trim().toUpperCase();

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

      row.push(cellSolution);
      currentCell += 1;
    }

    cells.push(row);
  }

  const clues = indexClues(cells, clueList);

  return {
    title,
    author,
    width,
    height,
    description: notes,
    copyright,
    cells,
    clues,
  };
}
