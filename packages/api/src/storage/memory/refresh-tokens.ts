import crypto from "node:crypto";
import type { RefreshTokenRecord } from "../types";

const tokens: Map<string, RefreshTokenRecord> = new Map();

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function storeRefreshToken(
  token: string,
  userId: string,
  expiresAt: number
): Promise<void> {
  tokens.set(hashRefreshToken(token), { tokenHash: hashRefreshToken(token), userId, expiresAt });
}

export async function getRefreshToken(token: string): Promise<RefreshTokenRecord | undefined> {
  return tokens.get(hashRefreshToken(token));
}

export async function deleteRefreshToken(token: string): Promise<void> {
  tokens.delete(hashRefreshToken(token));
}
