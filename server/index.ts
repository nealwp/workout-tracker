import express from "express";
import cors from "cors";
import crypto from "crypto";
import { Workout, ExerciseData } from "./types";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const workouts: Workout[] = [];

app.get("/workouts", (_req, res) => {
  res.json(workouts);
});

app.get("/workouts/:id", (req, res) => {
  const workout = workouts.find((w) => w.id === req.params.id);
  if (!workout) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }
  res.json(workout);
});

app.post("/workouts", (_req, res) => {
  const workout: Workout = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    exercises: [],
  };
  workouts.push(workout);
  res.status(201).json(workout);
});

app.post("/workouts/:id/exercises", (req, res) => {
  const workout = workouts.find((w) => w.id === req.params.id);
  if (!workout) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }

  const exercise: ExerciseData = {
    id: req.body.id,
    name: req.body.name,
    muscleGroup: req.body.muscleGroup,
    sets: req.body.sets || [],
  };

  workout.exercises.push(exercise);
  res.status(201).json(exercise);
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
});
