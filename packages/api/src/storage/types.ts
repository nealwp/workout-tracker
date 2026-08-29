import type { User, Workout, ExerciseData } from "@irondog/shared";

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface Storage {
  findOrCreateUser(info: GoogleUserInfo): Promise<User>;
  findUserById(userId: string): Promise<User | undefined>;
  listWorkouts(userId: string): Promise<Workout[]>;
  getWorkout(userId: string, workoutId: string): Promise<Workout | undefined>;
  createWorkout(userId: string): Promise<Workout>;
  addExercise(
    userId: string,
    workoutId: string,
    exercise: ExerciseData
  ): Promise<ExerciseData>;
  saveRefreshToken(refreshToken: string, userId: string, ttlSeconds: number): Promise<void>;
  hasRefreshToken(refreshToken: string): Promise<boolean>;
  deleteRefreshToken(refreshToken: string): Promise<void>;
}