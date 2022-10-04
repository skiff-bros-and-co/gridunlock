import { Cell, CellClue } from "./Puzzle";

export const buildCellCluesByRowAndColumn = (cells: Cell[][]): (CellClue | null)[][] => {
  let acrossClueNumber: number | null = null;
  const lastDownClueNumberByColumn: { [colIndex: number]: number | null } = {};
  return cells.map((row) => {
    return row.map((cell, colIndex) => {
      if ((!acrossClueNumber || colIndex === 0) && cell.clueNumber) {
        acrossClueNumber = cell.clueNumber;
      }
      if (!lastDownClueNumberByColumn[colIndex] && cell.clueNumber) {
        lastDownClueNumberByColumn[colIndex] = cell.clueNumber;
      }
      if (cell.isBlocked) {
        acrossClueNumber = null;
        lastDownClueNumberByColumn[colIndex] = null;
      }
      const downClueNumber = lastDownClueNumberByColumn[colIndex];
      if (!acrossClueNumber || !downClueNumber) {
        return null;
      }
      return {
        isStartOfClue: Boolean(cell.clueNumber),
        acrossClueNumber,
        downClueNumber,
      };
    });
  });
};
