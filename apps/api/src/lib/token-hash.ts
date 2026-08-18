import { createHash } from "crypto";

/** Refresh tokens nunca são armazenados em texto puro — apenas o hash SHA-256. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
