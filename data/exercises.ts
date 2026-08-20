export type MuscleGroup = "chest" | "shoulders" | "back" | "arms" | "legs";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
}

export const MUSCLE_GROUPS: { id: MuscleGroup; name: string }[] = [
  { id: "chest", name: "Chest" },
  { id: "shoulders", name: "Shoulders" },
  { id: "back", name: "Back" },
  { id: "arms", name: "Arms" },
  { id: "legs", name: "Legs" },
];

export const EXERCISES: Exercise[] = [
  // Chest
  { id: "incline-bench-press", name: "Incline Bench Press", muscleGroup: "chest" },
  { id: "flat-bench-press", name: "Flat Bench Press", muscleGroup: "chest" },
  { id: "decline-bench-press", name: "Decline Bench Press", muscleGroup: "chest" },
  { id: "flat-dumbbell-press", name: "Flat Dumbbell Press", muscleGroup: "chest" },
  { id: "incline-dumbbell-press", name: "Incline Dumbbell Press", muscleGroup: "chest" },
  { id: "pec-dec", name: "Pec-Deck", muscleGroup: "chest" },
  { id: "cable-fly", name: "Cable Fly", muscleGroup: "chest" },
  { id: "chest-dips", name: "Chest Dips", muscleGroup: "chest" },

  // Shoulders
  { id: "overhead-press", name: "Overhead Press", muscleGroup: "shoulders" },
  { id: "dumbbell-lateral-raise", name: "Dumbbell Lateral Raise", muscleGroup: "shoulders" },
  { id: "cable-lateral-raise", name: "Cable Lateral Raise", muscleGroup: "shoulders" },
  { id: "rear-delt-fly", name: "Rear Delt Fly", muscleGroup: "shoulders" },
  { id: "cable-front-raise", name: "Cable Front Raise", muscleGroup: "shoulders" },
  { id: "arnold-press", name: "Arnold Press", muscleGroup: "shoulders" },
  { id: "face-pulls", name: "Face Pulls", muscleGroup: "shoulders" },

  // Back
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "back" },
  { id: "seated-cable-row", name: "Seated Cable Row", muscleGroup: "back" },
  { id: "barbell-row", name: "Barbell Row", muscleGroup: "back" },
  { id: "chest-supported-row", name: "Chest-Supported Row", muscleGroup: "back" },
  { id: "pull-ups", name: "Pull-Ups", muscleGroup: "back" },
  { id: "deadlift", name: "Deadlift", muscleGroup: "back" },
  { id: "straight-arm-pulldown", name: "Straight Arm Pulldown", muscleGroup: "back" },
  { id: "rack-pulls", name: "Rack Pulls", muscleGroup: "back" },

  // Arms
  { id: "incline-dumbbell-curl", name: "Incline Dumbbell Curl", muscleGroup: "arms" },
  { id: "cable-curl", name: "Cable Curl", muscleGroup: "arms" },
  { id: "barbell-curl", name: "Barbell Curl", muscleGroup: "arms" },
  { id: "hammer-curl", name: "Hammer Curl", muscleGroup: "arms" },
  { id: "preacher-curl", name: "Preacher Curl", muscleGroup: "arms" },
  { id: "tricep-pushdown", name: "Tricep Pushdown", muscleGroup: "arms" },
  { id: "overhead-tricep-extension", name: "Overhead Tricep Extension", muscleGroup: "arms" },
  { id: "skull-crushers", name: "Skull Crushers", muscleGroup: "arms" },
  { id: "tricep-dips", name: "Tricep Dips", muscleGroup: "arms" },

  // Legs
  { id: "leg-press", name: "Leg Press", muscleGroup: "legs" },
  { id: "hack-squat", name: "Hack Squat", muscleGroup: "legs" },
  { id: "barbell-squat", name: "Barbell Squat", muscleGroup: "legs" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", muscleGroup: "legs" },
  { id: "leg-curl", name: "Leg Curl", muscleGroup: "legs" },
  { id: "leg-extension", name: "Leg Extension", muscleGroup: "legs" },
  { id: "calf-raise", name: "Calf Raise", muscleGroup: "legs" },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", muscleGroup: "legs" },
  { id: "hip-thrust", name: "Hip Thrust", muscleGroup: "legs" },
];
