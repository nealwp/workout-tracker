import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type { User, Workout, ExerciseData } from "@irondog/shared";
import type { GoogleUserInfo } from "./types";

const TABLE = process.env.DYNAMODB_TABLE ?? "irondog-api";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

interface TokenItem {
  pk: string;
  sk: string;
  userId: string;
  ttl: number;
}

interface UserItem {
  pk: string;
  sk: string;
  gsi1pk: string;
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  googleId: string;
  createdAt: string;
}

interface WorkoutItem {
  pk: string;
  sk: string;
  id: string;
  userId: string;
  date: string;
  exercises: ExerciseData[];
}

const userPk = (id: string) => `USER#${id}`;
const workoutPk = (userId: string) => `WRK#${userId}`;
const workoutSk = (id: string) => `W#${id}`;
const tokenPk = (refreshToken: string) => `TOKEN#${refreshToken}`;

function toUser(item: UserItem): User {
  return {
    id: item.id,
    email: item.email,
    name: item.name,
    avatarUrl: item.avatarUrl,
    googleId: item.googleId,
    createdAt: item.createdAt,
  };
}

function fromUser(user: User): UserItem {
  return {
    pk: userPk(user.id),
    sk: "PROFILE",
    gsi1pk: `GOOGLE#${user.googleId}`,
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    googleId: user.googleId,
    createdAt: user.createdAt,
  };
}

function toWorkout(item: WorkoutItem): Workout {
  return {
    id: item.id,
    userId: item.userId,
    date: item.date,
    exercises: item.exercises ?? [],
  };
}

export class DynamoDBStorage {
  async findOrCreateUser(info: GoogleUserInfo): Promise<User> {
    const existing = await this.findUserByGoogleId(info.googleId);
    if (existing) return existing;

    const user: User = {
      id: crypto.randomUUID(),
      email: info.email,
      name: info.name,
      avatarUrl: info.avatarUrl,
      googleId: info.googleId,
      createdAt: new Date().toISOString(),
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE,
          Item: fromUser(user),
          ConditionExpression: "attribute_not_exists(pk)",
        })
      );
    } catch (err) {
      const race = await this.findUserByGoogleId(info.googleId);
      if (race) return race;
      throw err;
    }
    return user;
  }

  async findUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: "GSI1",
        KeyConditionExpression: "gsi1pk = :g",
        ExpressionAttributeValues: { ":g": `GOOGLE#${googleId}` },
        Limit: 1,
      })
    );
    const item = result.Items?.[0];
    return item ? toUser(item as unknown as UserItem) : undefined;
  }

  async findUserById(userId: string): Promise<User | undefined> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { pk: userPk(userId), sk: "PROFILE" },
      })
    );
    return result.Item ? toUser(result.Item as unknown as UserItem) : undefined;
  }

  async listWorkouts(userId: string): Promise<Workout[]> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "pk = :p",
        ExpressionAttributeValues: { ":p": workoutPk(userId) },
      })
    );
    return (result.Items ?? []).map((item) => toWorkout(item as unknown as WorkoutItem));
  }

  async getWorkout(userId: string, workoutId: string): Promise<Workout | undefined> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { pk: workoutPk(userId), sk: workoutSk(workoutId) },
      })
    );
    return result.Item ? toWorkout(result.Item as unknown as WorkoutItem) : undefined;
  }

  async createWorkout(userId: string): Promise<Workout> {
    const workout: Workout = {
      id: randomUUID(),
      userId,
      date: new Date().toISOString(),
      exercises: [],
    };
    const item: WorkoutItem = {
      pk: workoutPk(userId),
      sk: workoutSk(workout.id),
      ...workout,
    };
    await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
    return workout;
  }

  async addExercise(
    userId: string,
    workoutId: string,
    exercise: ExerciseData
  ): Promise<ExerciseData> {
    const workout = await this.getWorkout(userId, workoutId);
    if (!workout) throw new Error("Workout not found");

    workout.exercises.push(exercise);
    const item: WorkoutItem = {
      pk: workoutPk(userId),
      sk: workoutSk(workoutId),
      ...workout,
    };
    await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
    return exercise;
  }

  async saveRefreshToken(refreshToken: string, userId: string, ttlSeconds: number): Promise<void> {
    const item: TokenItem = {
      pk: tokenPk(refreshToken),
      sk: "TOKEN",
      userId,
      ttl: Math.floor(Date.now() / 1000) + ttlSeconds,
    };
    await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
  }

  async hasRefreshToken(refreshToken: string): Promise<boolean> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { pk: tokenPk(refreshToken), sk: "TOKEN" },
      })
    );
    return result.Item !== undefined;
  }

  async deleteRefreshToken(refreshToken: string): Promise<void> {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { pk: tokenPk(refreshToken), sk: "TOKEN" },
      })
    );
  }
}