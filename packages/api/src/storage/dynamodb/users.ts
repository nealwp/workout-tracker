import crypto from "node:crypto";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { User } from "@irondog/shared";
import type { GoogleUserInfo } from "../types";
import { docClient } from "./shared";

export const USERS_TABLE = "irondog-users";

export interface UserRecord {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

function toUser(item: UserRecord): User {
  return {
    id: item.id,
    googleId: item.googleId,
    email: item.email,
    name: item.name,
    avatarUrl: item.avatarUrl,
    createdAt: item.createdAt,
  };
}

export async function createUser(info: GoogleUserInfo): Promise<User> {
  const user: User = {
    id: crypto.randomUUID(),
    googleId: info.googleId,
    email: info.email,
    name: info.name,
    avatarUrl: info.avatarUrl,
    createdAt: new Date().toISOString(),
  };
  const record: UserRecord = {
    id: user.id,
    googleId: user.googleId,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
  await docClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: record,
      ConditionExpression: "attribute_not_exists(id)",
    })
  );
  return user;
}

export async function getUserById(userId: string): Promise<User | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { id: userId },
    })
  );
  return result.Item ? toUser(result.Item as unknown as UserRecord) : undefined;
}

export async function getUserByGoogleId(googleId: string): Promise<User | undefined> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: "googleId-index",
      KeyConditionExpression: "googleId = :g",
      ExpressionAttributeValues: { ":g": googleId },
      Limit: 1,
    })
  );
  const item = result.Items?.[0];
  return item ? toUser(item as unknown as UserRecord) : undefined;
}
