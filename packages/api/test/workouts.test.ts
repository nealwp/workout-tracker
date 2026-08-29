import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Workout } from "@irondog/shared";
import {
  createWorkout,
  createWorkoutKey,
  getWorkout,
  listWorkouts,
  saveWorkout,
  deleteWorkout,
  __resetForTests,
} from "../src/storage/memory/workouts";

function craftWorkout(userId: string, id: string, date: string, exercises: Workout["exercises"] = []): Workout {
  return { id, userId, date, exercises };
}

before(async () => {
  await __resetForTests();
});

describe("memory workouts", () => {
  beforeEach(async () => {
    await __resetForTests();
  });

  it("creates a workout with an id, date, and empty exercises", async () => {
    const workout = await createWorkout("user-1");
    assert.ok(workout.id);
    assert.equal(workout.userId, "user-1");
    assert.ok(workout.date);
    assert.deepEqual(workout.exercises, []);
  });

  it("persists embedded exercises and sets", async () => {
    const workout = craftWorkout("user-1", "w-1", "2026-08-29T10:00:00.000Z", [
      {
        id: "lat-pulldown",
        name: "Lat Pulldown",
        muscleGroup: "back",
        sets: [{ id: 1, weight: 120, reps: 10, failure: false }],
      },
    ]);
    await saveWorkout(workout);
    const found = await getWorkout("user-1", createWorkoutKey(workout.date, workout.id));
    assert.equal(found?.exercises[0].name, "Lat Pulldown");
    assert.deepEqual(found?.exercises[0].sets, [{ id: 1, weight: 120, reps: 10, failure: false }]);
  });

  it("gets a workout by key", async () => {
    const workout = craftWorkout("user-1", "w-1", "2026-08-29T10:00:00.000Z");
    await saveWorkout(workout);
    const key = createWorkoutKey(workout.date, workout.id);
    const found = await getWorkout("user-1", key);
    assert.equal(found?.id, "w-1");
  });

  it("returns undefined for a missing workout", async () => {
    const found = await getWorkout("user-1", "missing#key");
    assert.equal(found, undefined);
  });

  it("lists only the authenticated user's workouts", async () => {
    await saveWorkout(craftWorkout("user-1", "w-1", "2026-08-01T10:00:00.000Z"));
    await saveWorkout(craftWorkout("user-2", "w-2", "2026-08-02T10:00:00.000Z"));
    await saveWorkout(craftWorkout("user-1", "w-3", "2026-08-03T10:00:00.000Z"));
    const userWorkouts = await listWorkouts("user-1");
    assert.deepEqual(userWorkouts.map((w) => w.id).sort(), ["w-1", "w-3"]);
  });

  it("lists workouts newest-first", async () => {
    await saveWorkout(craftWorkout("user-1", "old", "2026-08-01T10:00:00.000Z"));
    await saveWorkout(craftWorkout("user-1", "mid", "2026-08-10T10:00:00.000Z"));
    await saveWorkout(craftWorkout("user-1", "new", "2026-08-20T10:00:00.000Z"));
    const ids = (await listWorkouts("user-1")).map((w) => w.id);
    assert.deepEqual(ids, ["new", "mid", "old"]);
  });

  it("handles two workouts created at the same date/timestamp without key collisions", async () => {
    const date = "2026-08-29T19:34:15.127Z";
    const a = craftWorkout("user-1", "w-a", date);
    const b = craftWorkout("user-1", "w-b", date);
    await saveWorkout(a);
    await saveWorkout(b);
    assert.equal(createWorkoutKey(date, a.id), `${date}#w-a`);
    assert.equal(createWorkoutKey(date, b.id), `${date}#w-b`);
    const foundA = await getWorkout("user-1", createWorkoutKey(date, a.id));
    const foundB = await getWorkout("user-1", createWorkoutKey(date, b.id));
    assert.equal(foundA?.id, "w-a");
    assert.equal(foundB?.id, "w-b");
    assert.equal((await listWorkouts("user-1")).length, 2);
  });

  it("saves workout updates (whole-document save)", async () => {
    const workout = craftWorkout("user-1", "w-1", "2026-08-29T10:00:00.000Z");
    await saveWorkout(workout);
    const updated = craftWorkout("user-1", "w-1", workout.date, [
      { id: "squat", name: "Squat", muscleGroup: "legs", sets: [] },
    ]);
    await saveWorkout(updated);
    const found = await getWorkout("user-1", createWorkoutKey(workout.date, workout.id));
    assert.deepEqual(found, updated);
  });

  it("deletes a workout", async () => {
    await saveWorkout(craftWorkout("user-1", "w-1", "2026-08-29T10:00:00.000Z"));
    const key = createWorkoutKey("2026-08-29T10:00:00.000Z", "w-1");
    await deleteWorkout("user-1", key);
    assert.equal(await getWorkout("user-1", key), undefined);
  });
});
