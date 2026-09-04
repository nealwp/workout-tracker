import type { User, Workout, WorkoutsPage } from "@irondog/shared";

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface RefreshTokenRecord {
  tokenHash: string;
  userId: string;
  expiresAt: number;
}

export interface ListWorkoutsOptions {
  limit?: number;
  cursor?: string | null;
}

export interface Storage {
  findOrCreateUser(info: GoogleUserInfo): Promise<User>;
  getUserById(userId: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createWorkout(userId: string, workout?: Partial<Workout>): Promise<Workout>;
  getWorkout(userId: string, workoutId: string): Promise<Workout | undefined>;
  listWorkouts(userId: string, options?: ListWorkoutsOptions): Promise<WorkoutsPage>;
  listWorkoutsForDate(userId: string, date: string): Promise<Workout[]>;
  saveWorkout(workout: Workout): Promise<void>;
  deleteWorkout(userId: string, workoutId: string): Promise<void>;
  storeRefreshToken(token: string, userId: string, expiresAt: number): Promise<void>;
  getRefreshToken(token: string): Promise<RefreshTokenRecord | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
}
