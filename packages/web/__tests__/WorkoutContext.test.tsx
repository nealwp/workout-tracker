import React from "react";
import { Text } from "react-native";
import { render, act, screen } from "@testing-library/react-native";
import { WorkoutProvider, useWorkout } from "../context/WorkoutContext";
import { createWorkout, getTodayWorkout, addExerciseToWorkout } from "@/lib/api/client";

jest.mock("@/lib/api/client", () => ({
  createWorkout: jest.fn(),
  getTodayWorkout: jest.fn(),
  addExerciseToWorkout: jest.fn(),
}));

const mockCreateWorkout = createWorkout as jest.MockedFunction<typeof createWorkout>;
const mockGetTodayWorkout = getTodayWorkout as jest.MockedFunction<typeof getTodayWorkout>;
const mockAddExerciseToWorkout = addExerciseToWorkout as jest.MockedFunction<typeof addExerciseToWorkout>;

let latestCtx: ReturnType<typeof useWorkout>;

function TestConsumer() {
  latestCtx = useWorkout();
  return <Text testID="workoutId">{latestCtx.workoutId ?? "null"}</Text>;
}

function renderProvider() {
  render(
    <WorkoutProvider>
      <TestConsumer />
    </WorkoutProvider>
  );
}

describe("WorkoutContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestCtx = undefined!;
  });

  it("starts with null workoutId and empty completedExercises", () => {
    renderProvider();

    expect(latestCtx.workoutId).toBeNull();
    expect(latestCtx.completedExercises).toEqual([]);
    expect(screen.getByTestId("workoutId").props.children).toBe("null");
  });

  it("startWorkout sets workoutId and clears completedExercises", async () => {
    mockGetTodayWorkout.mockResolvedValue(null);
    mockCreateWorkout.mockResolvedValue({
      id: "workout-123",
      date: "2026-08-21",
      exercises: [],
    });

    renderProvider();

    await act(async () => {
      await latestCtx.startWorkout();
    });

    expect(latestCtx.workoutId).toBe("workout-123");
    expect(latestCtx.completedExercises).toEqual([]);
    expect(mockGetTodayWorkout).toHaveBeenCalledTimes(1);
    expect(mockCreateWorkout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("workoutId").props.children).toBe("workout-123");
  });

  it("resumes existing workout for today", async () => {
    const existingExercises = [
      { id: "flat-bench-press", name: "Flat Bench Press", muscleGroup: "chest", sets: [{ id: 1, weight: 135, reps: 10, failure: false }] },
    ];
    mockGetTodayWorkout.mockResolvedValue({
      id: "workout-existing",
      date: "2026-08-21",
      exercises: existingExercises,
    });

    renderProvider();

    await act(async () => {
      await latestCtx.startWorkout();
    });

    expect(latestCtx.workoutId).toBe("workout-existing");
    expect(latestCtx.completedExercises).toHaveLength(1);
    expect(latestCtx.completedExercises[0]).toEqual({
      id: "flat-bench-press",
      name: "Flat Bench Press",
      muscleGroup: "chest",
      sets: [{ id: 1, weight: 135, reps: 10, failure: false }],
    });
    expect(mockGetTodayWorkout).toHaveBeenCalledTimes(1);
    expect(mockCreateWorkout).not.toHaveBeenCalled();
    expect(screen.getByTestId("workoutId").props.children).toBe("workout-existing");
  });

  it("finishExercise adds exercise to completedExercises and calls API", async () => {
    mockGetTodayWorkout.mockResolvedValue(null);
    mockCreateWorkout.mockResolvedValue({
      id: "workout-456",
      date: "2026-08-21",
      exercises: [],
    });
    mockAddExerciseToWorkout.mockResolvedValue({});

    renderProvider();

    await act(async () => {
      await latestCtx.startWorkout();
    });

    const sets = [
      { id: 1, weight: 135, reps: 10, failure: false },
      { id: 2, weight: 155, reps: 8, failure: true },
    ];

    await act(async () => {
      await latestCtx.finishExercise("flat-bench-press", sets);
    });

    expect(latestCtx.completedExercises).toHaveLength(1);
    expect(latestCtx.completedExercises[0]).toEqual({
      id: "flat-bench-press",
      name: "Flat Bench Press",
      muscleGroup: "chest",
      sets,
    });
    expect(mockAddExerciseToWorkout).toHaveBeenCalledWith(
      "workout-456",
      {
        id: "flat-bench-press",
        name: "Flat Bench Press",
        muscleGroup: "chest",
        sets,
      }
    );
  });

  it("finishExercise does nothing if no workoutId", async () => {
    renderProvider();

    await act(async () => {
      await latestCtx.finishExercise("flat-bench-press", [
        { id: 1, weight: 135, reps: 10, failure: false },
      ]);
    });

    expect(latestCtx.completedExercises).toEqual([]);
    expect(mockAddExerciseToWorkout).not.toHaveBeenCalled();
  });

  it("finishExercise does nothing if exerciseId is invalid", async () => {
    mockGetTodayWorkout.mockResolvedValue(null);
    mockCreateWorkout.mockResolvedValue({
      id: "workout-789",
      date: "2026-08-21",
      exercises: [],
    });

    renderProvider();

    await act(async () => {
      await latestCtx.startWorkout();
    });

    await act(async () => {
      await latestCtx.finishExercise("nonexistent-exercise", [
        { id: 1, weight: 100, reps: 10, failure: false },
      ]);
    });

    expect(latestCtx.completedExercises).toEqual([]);
    expect(mockAddExerciseToWorkout).not.toHaveBeenCalled();
  });

  it("accumulates multiple completed exercises", async () => {
    mockGetTodayWorkout.mockResolvedValue(null);
    mockCreateWorkout.mockResolvedValue({
      id: "workout-abc",
      date: "2026-08-21",
      exercises: [],
    });
    mockAddExerciseToWorkout.mockResolvedValue({});

    renderProvider();

    await act(async () => {
      await latestCtx.startWorkout();
    });

    await act(async () => {
      await latestCtx.finishExercise("flat-bench-press", [
        { id: 1, weight: 135, reps: 10, failure: false },
      ]);
    });

    await act(async () => {
      await latestCtx.finishExercise("flat-dumbbell-press", [
        { id: 1, weight: 60, reps: 12, failure: false },
      ]);
    });

    expect(latestCtx.completedExercises).toHaveLength(2);
    expect(latestCtx.completedExercises[0].id).toBe("flat-bench-press");
    expect(latestCtx.completedExercises[1].id).toBe("flat-dumbbell-press");
  });

  it("resets state on new workout", async () => {
    mockGetTodayWorkout.mockResolvedValue(null);
    mockCreateWorkout.mockResolvedValue({
      id: "workout-1",
      date: "2026-08-21",
      exercises: [],
    });
    mockAddExerciseToWorkout.mockResolvedValue({});

    renderProvider();

    await act(async () => {
      await latestCtx.startWorkout();
    });

    await act(async () => {
      await latestCtx.finishExercise("flat-bench-press", [
        { id: 1, weight: 135, reps: 10, failure: false },
      ]);
    });

    expect(latestCtx.completedExercises).toHaveLength(1);

    mockCreateWorkout.mockResolvedValue({
      id: "workout-2",
      date: "2026-08-22",
      exercises: [],
    });

    await act(async () => {
      await latestCtx.startWorkout();
    });

    expect(latestCtx.workoutId).toBe("workout-2");
    expect(latestCtx.completedExercises).toEqual([]);
  });
});