import { generateMemorableToken } from "./generateMemorableToken";

interface ParsedRoomCode {
  name: string;
  password: string;
}

const SEPARATOR = "-";
const BITS_PER_PART = 32;

export function generateRoomCode() {
  return generateMemorableToken(BITS_PER_PART) + SEPARATOR + generateMemorableToken(BITS_PER_PART);
}

export function parseRoomCode(roomCode: string): ParsedRoomCode {
  const [name, password] = roomCode.split(SEPARATOR);
  return { name, password };
}
