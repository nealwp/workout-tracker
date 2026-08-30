import fs from "node:fs";
import path from "node:path";
import type { ExerciseData } from "@irondog/shared";
import type { Storage } from "./types";

interface HistoricalWorkout {
  id: string;
  date: string;
  exercises: ExerciseData[];
}

interface HistoricalWorkoutFile {
  version: number;
  workouts: HistoricalWorkout[];
}

// Candidate locations for data/historical-workouts.json, tried in order. The
// __dirname-relative paths cover running from src (tsx) or a standard tsc
// build; the cwd-relative path covers running `node dist/index.js` from the
// package root (npm sets cwd to the workspace dir for workspace scripts).
const HISTORY_FILE_CANDIDATES = [
  path.resolve(__dirname, "../../data/historical-workouts.json"),
  path.resolve(__dirname, "../../../data/historical-workouts.json"),
  path.resolve(process.cwd(), "data/historical-workouts.json"),
];

let cachedHistory: HistoricalWorkout[] | null = null;

function findHistoryFilePath(): string | undefined {
  return HISTORY_FILE_CANDIDATES.find((candidate) => fs.existsSync(candidate));
}

function loadHistoricalWorkouts(): HistoricalWorkout[] {
  if (cachedHistory) return cachedHistory;

  const historyFilePath = findHistoryFilePath();
  if (!historyFilePath) {
    cachedHistory = [];
    return cachedHistory;
  }

  const parsed = JSON.parse(fs.readFileSync(historyFilePath, "utf8")) as HistoricalWorkoutFile;
  if (parsed.version !== 1 || !Array.isArray(parsed.workouts)) {
    throw new Error("Unsupported or invalid workout history file");
  }

  cachedHistory = parsed.workouts;
  return cachedHistory;
}

/**
 * Seeds a local in-memory user's workout history from
 * packages/api/data/historical-workouts.json so past workout data (and the
 * "last time" exercise lookup) is available immediately in local dev without
 * manually logging workouts. No-op if the file is missing or empty. Safe to
 * call repeatedly (each workout is upserted by its stable id).
 */
export async function seedHistoricalWorkouts(
  storage: Pick<Storage, "createWorkout">,
  userId: string
): Promise<number> {
  const history = loadHistoricalWorkouts();

  for (const workout of history) {
    await storage.createWorkout(userId, {
      id: workout.id,
      date: workout.date,
      exercises: workout.exercises,
    });
  }

  return history.length;
}

export function __resetHistoricalWorkoutsCacheForTests(): void {
  cachedHistory = null;
}
