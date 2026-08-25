import { EXERCISES, MUSCLE_GROUPS } from "../data/exercises";

describe("Exercise Catalog", () => {
  it("has exercises for all muscle groups", () => {
    const muscleGroupIds = MUSCLE_GROUPS.map((g) => g.id);
    const exerciseGroupIds = [...new Set(EXERCISES.map((e) => e.muscleGroup))];

    expect(exerciseGroupIds.sort()).toEqual(muscleGroupIds.sort());
  });

  it("has at least 3 exercises per muscle group", () => {
    for (const group of MUSCLE_GROUPS) {
      const exercises = EXERCISES.filter((e) => e.muscleGroup === group.id);
      expect(exercises.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("each exercise has a unique id", () => {
    const ids = EXERCISES.map((e) => e.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toEqual(uniqueIds.length);
  });
});
