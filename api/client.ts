const API_BASE = "http://localhost:3001";

export async function createWorkout() {
  const res = await fetch(`${API_BASE}/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

export async function addExerciseToWorkout(
  workoutId: string,
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    sets: { id: number; weight: number; reps: number; failure: boolean }[];
  }
) {
  const res = await fetch(`${API_BASE}/workouts/${workoutId}/exercises`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exercise),
  });
  return res.json();
}
