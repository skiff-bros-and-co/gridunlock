import { CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";
import { getNextCell } from "./getNextCell";

export type WordPosition = "start" | "middle" | "end";

export type CellWordPosition = { [direction in FillDirection]: WordPosition };

export type CellWordPositions = CellWordPosition[][];

export function generateCellWordPositions(puzzle: PuzzleDefinition): CellWordPositions {
  const result: CellWordPositions = [];

  for (let row = 0; row < puzzle.height; row++) {
    const resultRow: CellWordPosition[] = [];
    for (let column = 0; column < puzzle.width; column++) {
      resultRow.push({
        across: wordPosition({ row, column }, "across", puzzle),
        down: wordPosition({ row, column }, "down", puzzle),
      });
    }
    result.push(resultRow);
  }

  return result;
}

function wordPosition(position: CellPosition, direction: FillDirection, puzzle: PuzzleDefinition): WordPosition {
  const prevPos = getNextCell({
    position,
    direction,
    puzzle,
    lockToCurrentWord: true,
    backwards: true,
  });
  const nextPos = getNextCell({
    position,
    direction,
    puzzle,
    lockToCurrentWord: true,
    backwards: false,
  });

  if (prevPos === position) {
    return "start";
  }
  if (nextPos === position) {
    return "end";
  }
  return "middle";
}
