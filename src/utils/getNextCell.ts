import { CellPosition, FillDirection, PuzzleDefinition } from "../state/Puzzle";

/**
 * Gets the next unblocked cell (regardless of fill state)
 */
export function getNextCell(opts: {
  position: CellPosition;
  direction: FillDirection;
  puzzle: PuzzleDefinition;
  wrapToNextClue: boolean;
  backwards?: boolean;
  lockToCurrentWord?: boolean;
}): CellPosition {
  const { position, direction, puzzle, wrapToNextClue } = opts;
  let { backwards, lockToCurrentWord } = opts;
  backwards ??= false;
  lockToCurrentWord ??= false;
  const distance = backwards ? -1 : 1;

  let nextPos = incrementCell(direction, distance, position, puzzle, wrapToNextClue);
  while (
    puzzle.cells[nextPos.row][nextPos.column].isBlocked &&
    !(nextPos.column === position.column && nextPos.row === position.row)
  ) {
    nextPos = incrementCell(direction, distance, nextPos, puzzle, wrapToNextClue);
  }

  const isInSameWord = areCluesEqual(position, nextPos, direction, puzzle);
  if (lockToCurrentWord && !isInSameWord) {
    return position;
  }

  if (isInSameWord || !wrapToNextClue) {
    return nextPos;
  }

  const currClueNumber = getClueNumber(position, direction, puzzle);
  if (currClueNumber == null) {
    return position;
  }

  const nextClueNumber = getNextClueNumber(direction, currClueNumber, backwards, puzzle);
  const firstCellInNextWord = puzzle.clues[direction][nextClueNumber].position;
  return backwards ? lastCellInWord(firstCellInNextWord, direction, puzzle) : firstCellInNextWord;
}

function incrementCell(
  direction: FillDirection,
  distance: number,
  position: CellPosition,
  puzzle: PuzzleDefinition,
  wrapSecondary: boolean,
): CellPosition {
  const [primary, secondary] =
    direction === "across" ? [position.column, position.row] : [position.row, position.column];

  const [primaryLimit, secondaryLimit] =
    direction === "across" ? [puzzle.width, puzzle.height] : [puzzle.height, puzzle.width];

  const nextPrimary = (primary + distance + primaryLimit) % primaryLimit;
  const secondaryDelta = wrapSecondary ? Math.floor((primary + distance) / primaryLimit) : 0;
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

export function getNextClueNumber(
  direction: FillDirection,
  clueNumber: number,
  backwards: boolean,
  puzzle: PuzzleDefinition,
) {
  let nextClueNumber = incrementClueNumber(clueNumber, backwards, puzzle);
  while (puzzle.clues[direction][nextClueNumber] == null) {
    nextClueNumber = incrementClueNumber(nextClueNumber, backwards, puzzle);
  }
  return nextClueNumber;
}

function incrementClueNumber(clueNumber: number, backwards: boolean, puzzle: PuzzleDefinition) {
  return ((puzzle.clues.clueCount + (clueNumber - 1) + (backwards ? -1 : +1)) % puzzle.clues.clueCount) + 1;
}

function lastCellInWord(position: CellPosition, direction: FillDirection, puzzle: PuzzleDefinition) {
  let prev = position;
  let next = position;
  do {
    prev = next;
    next = incrementCell(direction, 1, prev, puzzle, false);
  } while (areCluesEqual(position, next, direction, puzzle));

  return prev;
}

function areCluesEqual(a: CellPosition, b: CellPosition, direction: FillDirection, puzzle: PuzzleDefinition) {
  return getClueNumber(a, direction, puzzle) === getClueNumber(b, direction, puzzle);
}

function getClueNumber(position: CellPosition, direction: FillDirection, puzzle: PuzzleDefinition) {
  const currClue = puzzle.clues.byRowAndColumn[position.row][position.column];
  return direction === "across" ? currClue?.acrossClueNumber : currClue?.downClueNumber;
}
