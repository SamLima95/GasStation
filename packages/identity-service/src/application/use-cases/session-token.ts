import { createHash, randomBytes } from "crypto";

export function createRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(refreshToken: string): string {
  return createHash("sha256").update(refreshToken).digest("hex");
}

export function expiresFromNow(ttlSeconds: number, now = new Date()): Date {
  return new Date(now.getTime() + ttlSeconds * 1000);
}
