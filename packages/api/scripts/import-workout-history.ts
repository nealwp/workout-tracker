import fs from "node:fs/promises";
import path from "node:path";

import type { ExerciseData } from "@irondog/shared";
import { createWorkout, getWorkout } from "../src/storage/dynamodb/workouts";

interface HistoricalWorkout {
  id: string;
  date: string;
  exercises: ExerciseData[];
}

interface HistoricalWorkoutFile {
  version: number;
  workouts: HistoricalWorkout[];
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const file = arg("file");
  const userId = arg("user-id");
  const apply = process.argv.includes("--apply");

  if (!file || !userId) {
    throw new Error(
      "Usage: tsx scripts/import-workout-history.ts --file <json> --user-id <uuid> [--apply]",
    );
  }

  const parsed = JSON.parse(
    await fs.readFile(path.resolve(file), "utf8"),
  ) as HistoricalWorkoutFile;

  if (parsed.version !== 1 || !Array.isArray(parsed.workouts)) {
    throw new Error("Unsupported or invalid workout history file");
  }

  let imported = 0;
  let skipped = 0;

  for (const workout of parsed.workouts) {
    if (
      !workout.id ||
      !/^\d{4}-\d{2}-\d{2}$/.test(workout.date) ||
      !Array.isArray(workout.exercises)
    ) {
      throw new Error(`Invalid workout record: ${JSON.stringify(workout)}`);
    }

    if (!apply) {
      console.log(
        `[dry-run] ${workout.date}: ${workout.exercises.length} exercises / ` +
          `${workout.exercises.reduce((count, exercise) => count + exercise.sets.length, 0)} sets`,
      );
      continue;
    }

    const existing = await getWorkout(userId, workout.id);
    if (existing) {
      skipped += 1;
      console.log(`[skipped] ${workout.date} (${workout.id}) already exists`);
      continue;
    }

    await createWorkout(userId, workout);
    imported += 1;
    console.log(`[imported] ${workout.date} (${workout.id})`);
  }

  if (!apply) {
    console.log(
      `Dry run complete: ${parsed.workouts.length} workouts validated; no writes performed.`,
    );
  } else {
    console.log(`Import complete: ${imported} imported, ${skipped} skipped.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
