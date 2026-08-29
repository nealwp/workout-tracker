import crypto from "node:crypto";
import type { User } from "@irondog/shared";
import type { GoogleUserInfo } from "../types";

export interface UserRecord {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

const users: UserRecord[] = [];

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
  const record: UserRecord = {
    id: crypto.randomUUID(),
    googleId: info.googleId,
    email: info.email,
    name: info.name,
    avatarUrl: info.avatarUrl,
    createdAt: new Date().toISOString(),
  };
  users.push(record);
  return toUser(record);
}

export async function findOrCreateUser(info: GoogleUserInfo): Promise<User> {
  const existing = await getUserByGoogleId(info.googleId);
  if (existing) return existing;
  return createUser(info);
}

export async function getUserById(userId: string): Promise<User | undefined> {
  const item = users.find((u) => u.id === userId);
  return item ? toUser(item) : undefined;
}

export async function getUserByGoogleId(googleId: string): Promise<User | undefined> {
  const item = users.find((u) => u.googleId === googleId);
  return item ? toUser(item) : undefined;
}

export async function __resetForTests(): Promise<void> {
  users.length = 0;
}
