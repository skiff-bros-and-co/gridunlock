import type { CellClue, CellDefinition } from "./Puzzle";

export const buildCellCluesByRowAndColumn = (cells: CellDefinition[][]): (CellClue | undefined)[][] => {
  let currAcrossClueNumber: number | undefined;
  const currDownClueNumberByColumn: (number | undefined)[] = [];
  return cells.map((row, rowIndex) => {
    currAcrossClueNumber = undefined;

    return row.map((cell, colIndex) => {
      if (cell.isBlocked) {
        currAcrossClueNumber = undefined;
        currDownClueNumberByColumn[colIndex] = undefined;
      }

      const hasAcross = colIndex < row.length - 1 && !row[colIndex + 1].isBlocked;
      if (currAcrossClueNumber == null && cell.clueNumber != null && hasAcross) {
        currAcrossClueNumber = cell.clueNumber;
      }

      const hasDown = rowIndex < cells.length - 1 && !cells[rowIndex + 1][colIndex].isBlocked;
      if (currDownClueNumberByColumn[colIndex] == null && cell.clueNumber != null && hasDown) {
        currDownClueNumberByColumn[colIndex] = cell.clueNumber;
      }

      const downClueNumber = currDownClueNumberByColumn[colIndex];
      if (currAcrossClueNumber == null && downClueNumber == null) {
        return undefined;
      }
      return {
        isStartOfClue: cell.clueNumber != null,
        acrossClueNumber: currAcrossClueNumber,
        downClueNumber: downClueNumber,
      };
    });
  });
};
