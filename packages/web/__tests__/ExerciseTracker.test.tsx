import React from "react";
import { render, fireEvent, act, screen } from "@testing-library/react-native";
import ExerciseTracker from "../app/workout/exercise";
import { useWorkout } from "../context/WorkoutContext";
import { TestWrapper } from "./helpers/TestWrapper";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("../context/WorkoutContext", () => ({
  useWorkout: jest.fn(),
}));

const mockFinishExercise = jest.fn();
const mockUseWorkout = useWorkout as jest.MockedFunction<typeof useWorkout>;
const mockUseLocalSearchParams = require("expo-router").useLocalSearchParams as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLocalSearchParams.mockReturnValue({ exerciseId: "flat-bench-press" });
  mockUseWorkout.mockReturnValue({
    workoutId: "workout-123",
    completedExercises: [],
    startWorkout: jest.fn(),
    finishExercise: mockFinishExercise,
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("ExerciseTracker Screen", () => {
  it("renders the exercise name", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    expect(screen.getByText("Flat Bench Press")).toBeTruthy();
  });

  it("renders the initial set number", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    expect(screen.getByText("Set 1")).toBeTruthy();
  });

  it("renders weight and reps inputs", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    expect(screen.getAllByPlaceholderText("0")).toHaveLength(2);
  });

  it("renders LOG SET button", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    expect(screen.getByText("LOG SET")).toBeTruthy();
  });

  it("renders FINISH EXERCISE button", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    expect(screen.getByText("FINISH EXERCISE")).toBeTruthy();
  });

  it("renders failure toggle", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    expect(screen.getByText("TAKEN TO FAILURE?")).toBeTruthy();
  });

  it("shows Exercise not found for invalid exerciseId", () => {
    mockUseLocalSearchParams.mockReturnValue({ exerciseId: "nonexistent" });
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    expect(screen.getByText("Exercise not found")).toBeTruthy();
  });

  it("toggles failure state", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });

    fireEvent.press(screen.getByText("TAKEN TO FAILURE?"));
    expect(screen.getByText("FAILURE ✓")).toBeTruthy();

    fireEvent.press(screen.getByText("FAILURE ✓"));
    expect(screen.getByText("TAKEN TO FAILURE?")).toBeTruthy();
  });

  it("does not render completed sets section initially", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    expect(screen.queryByText("COMPLETED SETS")).toBeNull();
  });

  it("logs a set and shows it in completed sets", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });

    const inputs = screen.getAllByPlaceholderText("0");
    fireEvent.changeText(inputs[0], "135");
    fireEvent.changeText(inputs[1], "10");

    fireEvent.press(screen.getByText("LOG SET"));

    expect(screen.getByText("COMPLETED SETS")).toBeTruthy();
    expect(screen.getByText("Set 1")).toBeTruthy();
    expect(screen.getByText("135 lbs")).toBeTruthy();
  });

  it("increments set number after logging a set", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });

    const inputs = screen.getAllByPlaceholderText("0");
    fireEvent.changeText(inputs[0], "135");
    fireEvent.changeText(inputs[1], "10");
    fireEvent.press(screen.getByText("LOG SET"));

    expect(screen.getByText("Set 2")).toBeTruthy();
  });

  it("logs failure flag on a set", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });

    fireEvent.press(screen.getByText("TAKEN TO FAILURE?"));
    const inputs = screen.getAllByPlaceholderText("0");
    fireEvent.changeText(inputs[0], "225");
    fireEvent.changeText(inputs[1], "6");
    fireEvent.press(screen.getByText("LOG SET"));

    expect(screen.getByText("FAIL")).toBeTruthy();
  });

  it("calls finishExercise and navigates back on FINISH EXERCISE", async () => {
    mockFinishExercise.mockResolvedValue(undefined);

    render(<ExerciseTracker />, { wrapper: TestWrapper });

    const inputs = screen.getAllByPlaceholderText("0");
    fireEvent.changeText(inputs[0], "135");
    fireEvent.changeText(inputs[1], "10");

    await act(async () => {
      fireEvent.press(screen.getByText("FINISH EXERCISE"));
    });

    expect(mockFinishExercise).toHaveBeenCalledWith("flat-bench-press", [
      { id: 1, weight: 135, reps: 10, failure: false },
    ]);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("navigates back even with no sets logged", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });

    await act(async () => {
      fireEvent.press(screen.getByText("FINISH EXERCISE"));
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockFinishExercise).not.toHaveBeenCalled();
  });

  it("navigates back when Cancel is pressed", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });

    fireEvent.press(screen.getByText("Cancel"));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockFinishExercise).not.toHaveBeenCalled();
  });

  it("renders the rest timer at its default duration", () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    expect(screen.getByText("REST 1:00")).toBeTruthy();
  });

  it("starts counting down when the rest timer is pressed", () => {
    jest.useFakeTimers();
    render(<ExerciseTracker />, { wrapper: TestWrapper });

    fireEvent.press(screen.getByText("REST 1:00"));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("REST 0:59")).toBeTruthy();
  });

  it("restarts the rest timer when pressed again", () => {
    jest.useFakeTimers();
    render(<ExerciseTracker />, { wrapper: TestWrapper });

    fireEvent.press(screen.getByText("REST 1:00"));

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText("REST 0:59")).toBeTruthy();

    for (let i = 0; i < 4; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(screen.getByText("REST 0:55")).toBeTruthy();

    fireEvent.press(screen.getByText("REST 0:55"));
    expect(screen.getByText("REST 1:00")).toBeTruthy();
  });
});
