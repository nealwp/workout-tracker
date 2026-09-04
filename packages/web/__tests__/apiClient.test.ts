import {
  createWorkout,
  addExerciseToWorkout,
  getLastExercisePerformance,
  listWorkouts,
  signInWithGoogle,
  fetchMe,
  signOutServer,
  AuthError,
} from "@/lib/api/client";
import { tokenStore } from "../lib/secureStore";

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock("../lib/secureStore", () => ({
  tokenStore: {
    getAccessToken: jest.fn().mockResolvedValue("mock-access-token"),
    setAccessToken: jest.fn(),
    getRefreshToken: jest.fn().mockResolvedValue("mock-refresh-token"),
    setRefreshToken: jest.fn(),
    clearAll: jest.fn(),
  },
}));

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tokenStore.getAccessToken as jest.Mock).mockResolvedValue("mock-access-token");
    (tokenStore.getRefreshToken as jest.Mock).mockResolvedValue("mock-refresh-token");
  });

  describe("signInWithGoogle", () => {
    it("sends POST request to /auth/google with idToken", async () => {
      const mockResponse = {
        accessToken: "access-123",
        refreshToken: "refresh-123",
        user: { id: "u1", email: "test@gmail.com", name: "Test" },
      };
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

      const result = await signInWithGoogle("google-id-token");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "google-id-token" }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("fetchMe", () => {
    it("sends GET request to /auth/me with Authorization header", async () => {
      const mockUser = { id: "u1", email: "test@gmail.com", name: "Test" };
      mockFetch.mockResolvedValue({ json: () => Promise.resolve(mockUser) });

      const result = await fetchMe();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/auth/me",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        })
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("signOutServer", () => {
    it("sends POST request to /auth/logout with refreshToken", async () => {
      mockFetch.mockResolvedValue({ json: () => Promise.resolve({ success: true }) });

      await signOutServer("refresh-abc");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: "refresh-abc" }),
      });
    });
  });

  describe("createWorkout", () => {
    it("sends POST request to /workouts with Authorization header", async () => {
      const mockResponse = { id: "workout-123", date: "2026-08-21", exercises: [] };
      mockFetch.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const result = await createWorkout();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/workouts",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("propagates fetch errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(createWorkout()).rejects.toThrow("Network error");
    });
  });

  describe("addExerciseToWorkout", () => {
    it("sends POST request to /workouts/:id/exercises with auth header", async () => {
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
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(exercise),
        })
      );
      expect(result).toEqual(mockResponse);
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

  describe("getLastExercisePerformance", () => {
    it("sends GET request to /workouts/exercise/:exerciseId/last with auth header", async () => {
      const mockResponse = {
        date: "2026-08-15",
        exercise: {
          id: "flat-bench-press",
          name: "Flat Bench Press",
          muscleGroup: "chest",
          sets: [{ id: 1, weight: 135, reps: 10, failure: false }],
        },
      };
      mockFetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getLastExercisePerformance("flat-bench-press");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/workouts/exercise/flat-bench-press/last",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("returns null when no previous performance exists (404)", async () => {
      mockFetch.mockResolvedValue({
        status: 404,
        json: () => Promise.resolve({ error: "No previous workout found for this exercise" }),
      });

      const result = await getLastExercisePerformance("flat-bench-press");

      expect(result).toBeNull();
    });

    it("propagates fetch errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(getLastExercisePerformance("flat-bench-press")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("listWorkouts", () => {
    it("sends GET request to /workouts with auth header", async () => {
      const mockWorkouts = [
        {
          id: "w1",
          userId: "u1",
          date: "2026-08-21",
          exercises: [{ id: "flat-bench-press", name: "Flat Bench Press", muscleGroup: "chest", sets: [] }],
        },
      ];
      mockFetch.mockResolvedValue({ json: () => Promise.resolve(mockWorkouts) });

      const result = await listWorkouts();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/workouts",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        })
      );
      expect(result).toEqual(mockWorkouts);
    });

    it("propagates fetch errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(listWorkouts()).rejects.toThrow("Network error");
    });
  });

  describe("AuthError", () => {
    it("creates error with correct name", () => {
      const error = new AuthError("Session expired");
      expect(error.name).toBe("AuthError");
      expect(error.message).toBe("Session expired");
    });
  });
});
