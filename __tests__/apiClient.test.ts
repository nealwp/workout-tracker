import { createWorkout, addExerciseToWorkout } from "../api/client";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createWorkout", () => {
    it("sends POST request to /workouts", async () => {
      const mockResponse = { id: "workout-123", date: "2026-08-21", exercises: [] };
      mockFetch.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const result = await createWorkout();

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      expect(result).toEqual(mockResponse);
    });

    it("returns the parsed JSON response", async () => {
      const workout = { id: "abc", date: "2026-01-01", exercises: [] };
      mockFetch.mockResolvedValue({ json: () => Promise.resolve(workout) });

      const result = await createWorkout();

      expect(result).toEqual(workout);
    });

    it("propagates fetch errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(createWorkout()).rejects.toThrow("Network error");
    });
  });

  describe("addExerciseToWorkout", () => {
    it("sends POST request to /workouts/:id/exercises with exercise data", async () => {
      const exercise = {
        id: "flat-bench-press",
        name: "Flat Bench Press",
        muscleGroup: "chest",
        sets: [{ id: 1, weight: 135, reps: 10, failure: false }],
      };
      const mockResponse = { ...exercise };
      mockFetch.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const result = await addExerciseToWorkout("workout-456", exercise);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/workouts/workout-456/exercises",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(exercise),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("sends exercise with multiple sets", async () => {
      const exercise = {
        id: "barbell-squat",
        name: "Barbell Squat",
        muscleGroup: "legs",
        sets: [
          { id: 1, weight: 225, reps: 8, failure: false },
          { id: 2, weight: 245, reps: 6, failure: true },
          { id: 3, weight: 265, reps: 4, failure: true },
        ],
      };
      mockFetch.mockResolvedValue({ json: () => Promise.resolve(exercise) });

      await addExerciseToWorkout("workout-789", exercise);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.sets).toHaveLength(3);
      expect(body.sets[2]).toEqual({ id: 3, weight: 265, reps: 4, failure: true });
    });

    it("propagates fetch errors", async () => {
      mockFetch.mockRejectedValue(new Error("Server error"));

      await expect(
        addExerciseToWorkout("workout-123", {
          id: "test",
          name: "Test",
          muscleGroup: "chest",
          sets: [],
        })
      ).rejects.toThrow("Server error");
    });
  });
});
