import { randomUUID } from "node:crypto";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Workout, ExerciseData } from "@irondog/shared";
import { docClient } from "./shared";

export const WORKOUTS_TABLE = "irondog-workouts";
export const DATE_INDEX = "date-index";

export interface WorkoutRecord {
  userId: string;
  id: string;
  date: string;
  exercises: ExerciseData[];
}

function toWorkout(item: WorkoutRecord): Workout {
  return {
    id: item.id,
    userId: item.userId,
    date: item.date,
    exercises: item.exercises ?? [],
  };
}

function toRecord(workout: Workout): WorkoutRecord {
  return {
    userId: workout.userId,
    id: workout.id,
    date: workout.date,
    exercises: workout.exercises,
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
  const result = await docClient.send(
    new GetCommand({
      TableName: WORKOUTS_TABLE,
      Key: { userId, id: workoutId },
    })
  );
  return result.Item ? toWorkout(result.Item as unknown as WorkoutRecord) : undefined;
}

export async function listWorkouts(userId: string): Promise<Workout[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: WORKOUTS_TABLE,
      IndexName: DATE_INDEX,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": userId },
      ScanIndexForward: false,
    })
  );
  return (result.Items ?? []).map((item) => toWorkout(item as unknown as WorkoutRecord));
}

export async function saveWorkout(workout: Workout): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: WORKOUTS_TABLE,
      Item: toRecord(workout),
    })
  );
}

export async function deleteWorkout(userId: string, workoutId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: WORKOUTS_TABLE,
      Key: { userId, id: workoutId },
    })
  );
}