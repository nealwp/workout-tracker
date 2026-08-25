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
