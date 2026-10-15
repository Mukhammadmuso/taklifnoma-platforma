import { randomBytes } from "node:crypto";

/** Mehmon tokeni: 12 belgili, taxmin qilib bo'lmaydigan (72 bit tasodif) */
export function guestToken() {
  return randomBytes(9).toString("base64url");
}
