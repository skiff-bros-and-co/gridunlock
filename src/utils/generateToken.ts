import { encode } from "bs58";

export function generateToken() {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  return encode(buffer);
}
