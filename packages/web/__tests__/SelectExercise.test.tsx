import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import SelectExercise from "../app/workout/select-exercise";
import { useWorkout } from "../context/WorkoutContext";
import { MUSCLE_GROUPS } from "../data/exercises";
import { TestWrapper } from "./helpers/TestWrapper";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Fontisto: "Fontisto",
  MaterialIcons: "MaterialIcons",
}));

jest.mock("../context/WorkoutContext", () => ({
  useWorkout: jest.fn(),
}));

const mockUseWorkout = useWorkout as jest.MockedFunction<typeof useWorkout>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseWorkout.mockReturnValue({
    workoutId: "workout-123",
    completedExercises: [],
    startWorkout: jest.fn(),
    finishExercise: jest.fn(),
  });
});

describe("SelectExercise Screen", () => {
  it("renders the muscle group heading", () => {
    render(<SelectExercise />, { wrapper: TestWrapper });
    expect(screen.getByText("Choose Muscle Group")).toBeTruthy();
  });

  it("renders all muscle group buttons", () => {
    render(<SelectExercise />, { wrapper: TestWrapper });
    for (const group of MUSCLE_GROUPS) {
      expect(screen.getByText(group.name)).toBeTruthy();
    }
  });

  it("does not show exercises before selecting a muscle group", () => {
    render(<SelectExercise />, { wrapper: TestWrapper });
    expect(screen.queryByText("Choose Exercise")).toBeNull();
  });

  it("shows exercises when a muscle group is selected", () => {
    render(<SelectExercise />, { wrapper: TestWrapper });

    fireEvent.press(screen.getByText("Chest"));

    expect(screen.getByText("Choose Exercise")).toBeTruthy();
    expect(screen.getByText("Incline Bench Press")).toBeTruthy();
    expect(screen.getByText("Cable Fly")).toBeTruthy();
  });

  it("navigates to exercise screen when exercise is pressed", () => {
    render(<SelectExercise />, { wrapper: TestWrapper });

    fireEvent.press(screen.getByText("Chest"));
    fireEvent.press(screen.getByText("Cable Fly"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/workout/exercise",
      params: { exerciseId: "cable-fly" },
    });
  });

  it("filters exercises by selected muscle group", () => {
    render(<SelectExercise />, { wrapper: TestWrapper });

    fireEvent.press(screen.getByText("Legs"));

    expect(screen.getByText("Leg Press")).toBeTruthy();
    expect(screen.getByText("Leg Curl")).toBeTruthy();
    expect(screen.queryByText("Cable Fly")).toBeNull();
  });

  it("shows completed exercises when available", () => {
    mockUseWorkout.mockReturnValue({
      workoutId: "workout-123",
      completedExercises: [
        {
          id: "cable-chest-press",
          name: "Cable Chest Press",
          muscleGroup: "chest",
          sets: [
            { id: 1, weight: 135, reps: 10, failure: false },
            { id: 2, weight: 155, reps: 8, failure: true },
          ],
        },
      ],
      startWorkout: jest.fn(),
      finishExercise: jest.fn(),
    });

    render(<SelectExercise />, { wrapper: TestWrapper });

    expect(screen.getByText(/Completed Exercises/)).toBeTruthy();
    expect(screen.getByText("Cable Chest Press")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });
});
