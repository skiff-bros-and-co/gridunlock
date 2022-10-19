import { CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";

/**
 * Gets the next unblocked cell (regardless of fill state)
 */
export function getNextCell(opts: {
  position: CellPosition;
  direction: FillDirection;
  puzzle: PuzzleDefinition;
  backwards?: boolean;
  lockToCurrentWord?: boolean;
}): CellPosition {
  const { position, direction, puzzle } = opts;
  let { backwards, lockToCurrentWord } = opts;
  backwards ??= false;
  lockToCurrentWord ??= false;
  const distance = backwards ? -1 : 1;

  let nextPos = nextCell(direction, distance, position, puzzle);
  while (puzzle.cells[nextPos.row][nextPos.column].isBlocked) {
    nextPos = nextCell(direction, distance, nextPos, puzzle);
  }

  if (lockToCurrentWord) {
    const isInSameWord =
      direction === "across"
        ? nextPos.row === position.row && nextPos.column === position.column + distance
        : nextPos.row === position.row + distance && nextPos.column === position.column;
    if (!isInSameWord) {
      return position;
    }
  }

  return nextPos;
}

function nextCell(
  direction: FillDirection,
  distance: number,
  position: CellPosition,
  puzzle: PuzzleDefinition,
): CellPosition {
  const [primary, secondary] =
    direction === "across" ? [position.column, position.row] : [position.row, position.column];

  const [primaryLimit, secondaryLimit] =
    direction === "across" ? [puzzle.width, puzzle.height] : [puzzle.height, puzzle.width];

  const nextPrimary = (primary + distance + primaryLimit) % primaryLimit;
  const secondaryDelta = Math.trunc((primary + distance) / primaryLimit);
  const nextSecondary = (secondary + secondaryDelta + secondaryLimit) % secondaryLimit;

  return direction === "across"
    ? {
        row: nextSecondary,
        column: nextPrimary,
      }
    : {
        row: nextPrimary,
        column: nextSecondary,
      };
}
