export interface SetData {
  id: number;
  weight: number;
  reps: number;
  failure: boolean;
}

export interface ExerciseData {
  id: string;
  name: string;
  muscleGroup: string;
  sets: SetData[];
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  exercises: ExerciseData[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  googleId: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
}
