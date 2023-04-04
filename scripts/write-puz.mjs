import { writepuz } from "@confuzzle/writepuz";
import fs from "fs";

const puz = {
  title: "Simple Test",
  author: "Test Author",
  copyright: "Copyright (C) 2023",
  note: "This is a test note",
  width: 3,
  height: 3,
  clues: ["clue 1", "clue 2", "clue 3"],
  solution: "CAT.B.ECO",
  state: "-A-.-.--O",
};
const puzbytes = writepuz(puz);
fs.writeFileSync("../test/parsers/simple-generated.puz", Buffer.from(puzbytes));
