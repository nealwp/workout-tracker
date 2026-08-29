import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import type { User, Workout, ExerciseData } from "@irondog/shared";
import type { Storage, GoogleUserInfo } from "./types";

export class MemoryStorage implements Storage {
  private users: User[] = [];
  private workouts: Workout[] = [];
  private refreshTokens = new Map<string, string>();

  async findOrCreateUser(info: GoogleUserInfo): Promise<User> {
    let user = this.users.find((u) => u.googleId === info.googleId);
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email: info.email,
        name: info.name,
        avatarUrl: info.avatarUrl,
        googleId: info.googleId,
        createdAt: new Date().toISOString(),
      };
      this.users.push(user);
    }
    return user;
  }

  async findUserById(userId: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === userId);
  }

  async listWorkouts(userId: string): Promise<Workout[]> {
    return this.workouts
      .filter((w) => w.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async getWorkout(userId: string, workoutId: string): Promise<Workout | undefined> {
    return this.workouts.find((w) => w.id === workoutId && w.userId === userId);
  }

  async createWorkout(userId: string): Promise<Workout> {
    const workout: Workout = {
      id: randomUUID(),
      userId,
      date: new Date().toISOString(),
      exercises: [],
    };
    this.workouts.push(workout);
    return workout;
  }

  async addExercise(
    userId: string,
    workoutId: string,
    exercise: ExerciseData
  ): Promise<ExerciseData> {
    const workout = this.workouts.find((w) => w.id === workoutId && w.userId === userId);
    if (!workout) throw new Error("Workout not found");
    workout.exercises.push(exercise);
    return exercise;
  }

  async saveRefreshToken(refreshToken: string, userId: string, _ttlSeconds: number): Promise<void> {
    this.refreshTokens.set(refreshToken, userId);
  }

  async hasRefreshToken(refreshToken: string): Promise<boolean> {
    return this.refreshTokens.has(refreshToken);
  }

  async deleteRefreshToken(refreshToken: string): Promise<void> {
    this.refreshTokens.delete(refreshToken);
  }
}