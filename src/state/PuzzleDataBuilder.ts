import { CellClue, CellDefinition } from "./Puzzle";

export const buildCellCluesByRowAndColumn = (cells: CellDefinition[][]): (CellClue | undefined)[][] => {
  let acrossClueNumber: number | undefined = undefined;
  const lastDownClueNumberByColumn: { [colIndex: number]: number | undefined } = {};
  return cells.map((row) => {
    return row.map((cell, colIndex) => {
      if (colIndex === 0) {
        acrossClueNumber = undefined;
      }
      if (cell.isBlocked) {
        acrossClueNumber = undefined;
        lastDownClueNumberByColumn[colIndex] = undefined;
      }

      if (!acrossClueNumber && cell.clueNumber) {
        acrossClueNumber = cell.clueNumber;
      }
      if (!lastDownClueNumberByColumn[colIndex] && cell.clueNumber) {
        lastDownClueNumberByColumn[colIndex] = cell.clueNumber;
      }

      const downClueNumber = lastDownClueNumberByColumn[colIndex];
      if (!acrossClueNumber && !downClueNumber) {
        return undefined;
      }
      return {
        isStartOfClue: Boolean(cell.clueNumber),
        acrossClueNumber: acrossClueNumber || undefined,
        downClueNumber: downClueNumber || undefined,
      };
    });
  });
};
