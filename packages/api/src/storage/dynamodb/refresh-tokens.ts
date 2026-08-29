import crypto from "node:crypto";
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./shared";

export const REFRESH_TOKENS_TABLE = "irondog-refresh-tokens";

export interface RefreshTokenRecord {
  tokenHash: string;
  userId: string;
  expiresAt: number;
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function storeRefreshToken(
  token: string,
  userId: string,
  expiresAt: number
): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: REFRESH_TOKENS_TABLE,
      Item: { tokenHash: hashRefreshToken(token), userId, expiresAt },
    })
  );
}

export async function getRefreshToken(token: string): Promise<RefreshTokenRecord | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: REFRESH_TOKENS_TABLE,
      Key: { tokenHash: hashRefreshToken(token) },
    })
  );
  return result.Item as RefreshTokenRecord | undefined;
}

export async function deleteRefreshToken(token: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: REFRESH_TOKENS_TABLE,
      Key: { tokenHash: hashRefreshToken(token) },
    })
  );
}
