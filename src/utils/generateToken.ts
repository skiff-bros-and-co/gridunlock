import bs58 from "bs58";

export function generateToken(bits = 128) {
  const buffer = new Uint8Array(Math.ceil(bits / 8));
  crypto.getRandomValues(buffer);
  return bs58.encode(buffer);
}
