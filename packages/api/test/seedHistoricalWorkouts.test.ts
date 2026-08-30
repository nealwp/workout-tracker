import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createWorkout,
  getWorkout,
  listWorkouts,
  __resetForTests,
} from "../src/storage/memory/workouts";
import {
  seedHistoricalWorkouts,
  __resetHistoricalWorkoutsCacheForTests,
} from "../src/storage/seedHistoricalWorkouts";

before(async () => {
  await __resetForTests();
  __resetHistoricalWorkoutsCacheForTests();
});

describe("seedHistoricalWorkouts", () => {
  beforeEach(async () => {
    await __resetForTests();
    __resetHistoricalWorkoutsCacheForTests();
  });

  it("imports every workout from the historical data file for the given user", async () => {
    const count = await seedHistoricalWorkouts({ createWorkout }, "local-user");

    assert.ok(count > 0);
    const workouts = await listWorkouts("local-user");
    assert.equal(workouts.length, count);
  });

  it("seeded workouts include exercises with sets and failure flags", async () => {
    await seedHistoricalWorkouts({ createWorkout }, "local-user");

    const workout = await getWorkout("local-user", "history-2026-08-01");
    assert.ok(workout);
    const tricepPushdown = workout?.exercises.find((e) => e.id === "tricep-pushdown");
    assert.ok(tricepPushdown);
    assert.equal(tricepPushdown?.sets.length, 4);
  });

  it("does not seed data for a different user", async () => {
    await seedHistoricalWorkouts({ createWorkout }, "local-user");

    const otherUsersWorkouts = await listWorkouts("someone-else");
    assert.deepEqual(otherUsersWorkouts, []);
  });

  it("is idempotent when called twice for the same user", async () => {
    const firstCount = await seedHistoricalWorkouts({ createWorkout }, "local-user");
    const secondCount = await seedHistoricalWorkouts({ createWorkout }, "local-user");

    assert.equal(firstCount, secondCount);
    const workouts = await listWorkouts("local-user");
    assert.equal(workouts.length, firstCount);
  });
});
