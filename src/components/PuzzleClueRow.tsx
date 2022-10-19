import { useEffect, useRef } from "react";
import { Clue } from "../state/Puzzle";

interface Props {
  clue: Clue;
  isSelected: boolean;
}

export const PuzzleClueRow = (props: Props): JSX.Element => {
  const ref = useRef<null | HTMLLIElement>(null);
  useEffect(() => {
    if (props.isSelected) {
      ref.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
  }, [props.isSelected, ref]);

  return (
    <li ref={ref} className={props.isSelected ? "puzzle-clue selected-puzzle-clue" : "puzzle-clue"}>
      {props.clue.clueNumber}. {props.clue.clue}
    </li>
  );
};
