import { randomUUID } from "node:crypto";
import type { Workout, ExerciseData } from "@irondog/shared";

export interface WorkoutRecord {
  userId: string;
  workoutKey: string;
  id: string;
  date: string;
  exercises: ExerciseData[];
}

const workouts: WorkoutRecord[] = [];

export function createWorkoutKey(date: string, id: string): string {
  return `${date}#${id}`;
}

function toRecord(workout: Workout): WorkoutRecord {
  return {
    userId: workout.userId,
    workoutKey: createWorkoutKey(workout.date, workout.id),
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

export async function createWorkout(userId: string): Promise<Workout> {
  const workout: Workout = {
    id: randomUUID(),
    userId,
    date: new Date().toISOString(),
    exercises: [],
  };
  await saveWorkout(workout);
  return workout;
}

export async function getWorkout(
  userId: string,
  workoutKey: string
): Promise<Workout | undefined> {
  const item = workouts.find((w) => w.userId === userId && w.workoutKey === workoutKey);
  return item ? toWorkout(item) : undefined;
}

export async function listWorkouts(userId: string): Promise<Workout[]> {
  return workouts
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(toWorkout);
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const record = toRecord(workout);
  const index = workouts.findIndex((w) => w.workoutKey === record.workoutKey);
  if (index >= 0) workouts[index] = record;
  else workouts.push(record);
}

export async function deleteWorkout(userId: string, workoutKey: string): Promise<void> {
  const index = workouts.findIndex((w) => w.userId === userId && w.workoutKey === workoutKey);
  if (index >= 0) workouts.splice(index, 1);
}
