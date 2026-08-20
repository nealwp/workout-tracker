import { createContext, useContext, useState, ReactNode } from "react";
import { createWorkout, addExerciseToWorkout } from "@/api/client";
import { EXERCISES } from "@/data/exercises";

interface SetData {
  id: number;
  weight: number;
  reps: number;
  failure: boolean;
}

interface ExerciseData {
  id: string;
  name: string;
  muscleGroup: string;
  sets: SetData[];
}

interface WorkoutContextType {
  workoutId: string | null;
  startWorkout: () => Promise<void>;
  finishExercise: (exerciseId: string, sets: SetData[]) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const startWorkout = async () => {
    const workout = await createWorkout();
    setWorkoutId(workout.id);
  };

  const finishExercise = async (exerciseId: string, sets: SetData[]) => {
    if (!workoutId) return;

    const exercise = EXERCISES.find((e) => e.id === exerciseId);
    if (!exercise) return;

    await addExerciseToWorkout(workoutId, {
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets,
    });
  };

  return (
    <WorkoutContext.Provider value={{ workoutId, startWorkout, finishExercise }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
