import { testPuzzleData } from "../state/TestData";
import { Header } from "./Header";
import { PuzzleView } from "./PuzzleView";

export function Root() {
  return (
    <div className="root">
      <Header />
      <PuzzleView puzzleDefinition={testPuzzleData}></PuzzleView>
    </div>
  );
}
