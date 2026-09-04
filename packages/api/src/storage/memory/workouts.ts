import { randomUUID } from "node:crypto";
import type { Workout, ExerciseData, WorkoutsPage } from "@irondog/shared";
import { decodeCursor, cursorFromWorkout } from "../cursor";
import type { ListWorkoutsOptions } from "../types";

export interface WorkoutRecord {
  userId: string;
  id: string;
  date: string;
  exercises: ExerciseData[];
}

const workouts: WorkoutRecord[] = [];

function toRecord(workout: Workout): WorkoutRecord {
  return {
    userId: workout.userId,
    id: workout.id,
    date: workout.date,
    exercises: workout.exercises,
  };
}

function toWorkout(item: WorkoutRecord): Workout {
  return {
    id: item.id,
    userId: item.userId,
    date: item.date,
    exercises: item.exercises ?? [],
  };
}

export async function createWorkout(userId: string, workout?: Partial<Workout>): Promise<Workout> {
  const newWorkout: Workout = {
    id: workout?.id ?? randomUUID(),
    userId,
    date: workout?.date ?? new Date().toISOString(),
    exercises: workout?.exercises ?? [],
  };
  await saveWorkout(newWorkout);
  return newWorkout;
}

export async function getWorkout(
  userId: string,
  workoutId: string
): Promise<Workout | undefined> {
  const item = workouts.find((w) => w.userId === userId && w.id === workoutId);
  return item ? toWorkout(item) : undefined;
}

function sortedForUser(userId: string): WorkoutRecord[] {
  return workouts
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export async function listWorkouts(
  userId: string,
  options: ListWorkoutsOptions = {}
): Promise<WorkoutsPage> {
  const limit = options.limit ?? 25;
  const sorted = sortedForUser(userId);

  let start = 0;
  if (options.cursor) {
    const key = decodeCursor(options.cursor);
    if (key.userId !== userId) throw new Error("Invalid cursor");
    const index = sorted.findIndex((w) => w.date === key.date && w.id === key.id);
    if (index >= 0) start = index + 1;
  }

  const items = sorted.slice(start, start + limit).map(toWorkout);
  const nextCursor =
    start + items.length < sorted.length && items.length > 0
      ? cursorFromWorkout(items[items.length - 1])
      : null;

  return { items, nextCursor };
}

export async function listWorkoutsForDate(userId: string, date: string): Promise<Workout[]> {
  return sortedForUser(userId)
    .filter((w) => w.date.startsWith(date))
    .map(toWorkout);
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const record = toRecord(workout);
  const index = workouts.findIndex(
    (w) => w.userId === record.userId && w.id === record.id
  );
  if (index >= 0) workouts[index] = record;
  else workouts.push(record);
}

export async function deleteWorkout(userId: string, workoutId: string): Promise<void> {
  const index = workouts.findIndex((w) => w.userId === userId && w.id === workoutId);
  if (index >= 0) workouts.splice(index, 1);
}

export async function __resetForTests(): Promise<void> {
  workouts.length = 0;
}