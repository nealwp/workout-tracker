import type { Workout } from "@irondog/shared";

export interface CursorKey {
  userId: string;
  date: string;
  id: string;
}

export function encodeCursor(key: CursorKey): string {
  return Buffer.from(JSON.stringify(key)).toString("base64url");
}

export function decodeCursor(cursor: string): CursorKey {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as CursorKey;
  } catch {
    throw new Error("Invalid cursor");
  }
}

export function cursorFromWorkout(workout: Workout): string {
  return encodeCursor({ userId: workout.userId, date: workout.date, id: workout.id });
}