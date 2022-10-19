import { TOKEN_WORDLIST } from "./wordlist";

const BITS_PER_WORD = Math.floor(Math.log2(TOKEN_WORDLIST.length));

export function generateMemorableToken(bits = 128, separator = "_") {
  const wordCount = Math.ceil(bits / BITS_PER_WORD);

  const result = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(pickWord());
  }

  return result.join(separator);
}

function pickWord() {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return TOKEN_WORDLIST[buffer.at(0)! % TOKEN_WORDLIST.length];
}
