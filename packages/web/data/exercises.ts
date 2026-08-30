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
  { id: "cable-chest-press", name: "Cable Chest Press", muscleGroup: "chest" },
  { id: "cable-fly", name: "Cable Fly", muscleGroup: "chest" },
  {
    id: "chest-press-machine",
    name: "Chest Press Machine",
    muscleGroup: "chest",
  },
  {
    id: "incline-bench-press",
    name: "Incline Bench Press",
    muscleGroup: "chest",
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    muscleGroup: "chest",
  },
  { id: "pec-dec", name: "Pec-Deck", muscleGroup: "chest" },

  // Shoulders
  { id: "lateral-raise", name: "Lateral Raise", muscleGroup: "shoulders" },
  { id: "overhead-press", name: "Overhead Press", muscleGroup: "shoulders" },
  {
    id: "shoulder-press-machine",
    name: "Shoulder Press Machine",
    muscleGroup: "shoulders",
  },
  { id: "shrug", name: "Shrug", muscleGroup: "shoulders" },
  { id: "upright-row", name: "Upright Row", muscleGroup: "shoulders" },

  // Back
  {
    id: "chest-supported-row",
    name: "Chest-Supported Row",
    muscleGroup: "back",
  },
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "back" },
  { id: "reverse-pec-deck", name: "Reverse Pec Deck", muscleGroup: "back" },
  { id: "seated-cable-row", name: "Seated Cable Row", muscleGroup: "back" },
  {
    id: "straight-arm-pulldown",
    name: "Straight Arm Pulldown",
    muscleGroup: "back",
  },

  // Arms
  { id: "cable-curl", name: "Cable Curl", muscleGroup: "arms" },
  { id: "dip-machine", name: "Dip Machine", muscleGroup: "arms" },
  { id: "dumbbell-curl", name: "Dumbbell Curl", muscleGroup: "arms" },
  { id: "hammer-curl", name: "Hammer Curl", muscleGroup: "arms" },
  {
    id: "overhead-tricep-extension",
    name: "Overhead Tricep Extension",
    muscleGroup: "arms",
  },
  { id: "preacher-curl", name: "Preacher Curl", muscleGroup: "arms" },
  { id: "tricep-pushdown", name: "Tricep Pushdown", muscleGroup: "arms" },

  // Legs
  { id: "calf-raise", name: "Calf Raise", muscleGroup: "legs" },
  { id: "leg-curl", name: "Leg Curl", muscleGroup: "legs" },
  { id: "leg-extension", name: "Leg Extension", muscleGroup: "legs" },
  { id: "leg-press", name: "Leg Press", muscleGroup: "legs" },
];
