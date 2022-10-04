import { testPuzzleData } from "../state/TestData";
import { PuzzleView } from "./PuzzleView";

export function Root() {
  return (
    <div className="root">
      <PuzzleView puzzleDefinition={testPuzzleData}></PuzzleView>
    </div>
  );
}
