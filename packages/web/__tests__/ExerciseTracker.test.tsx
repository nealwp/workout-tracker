import React from "react";
import { render, fireEvent, act, screen } from "@testing-library/react-native";
import ExerciseTracker from "../app/workout/exercise";
import { useWorkout } from "../context/WorkoutContext";
import { getLastExercisePerformance } from "@/lib/api/client";
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

jest.mock("@/lib/api/client", () => ({
  getLastExercisePerformance: jest.fn(),
}));

const mockFinishExercise = jest.fn();
const mockUseWorkout = useWorkout as jest.MockedFunction<typeof useWorkout>;
const mockUseLocalSearchParams = require("expo-router").useLocalSearchParams as jest.Mock;
const mockGetLastExercisePerformance = getLastExercisePerformance as jest.MockedFunction<
  typeof getLastExercisePerformance
>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLocalSearchParams.mockReturnValue({ exerciseId: "incline-bench-press" });
  mockUseWorkout.mockReturnValue({
    workoutId: "workout-123",
    completedExercises: [],
    startWorkout: jest.fn(),
    finishExercise: mockFinishExercise,
  });
  mockGetLastExercisePerformance.mockResolvedValue(null);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("ExerciseTracker Screen", () => {
  it("renders the exercise name", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});
    expect(screen.getByText("Incline Bench Press")).toBeTruthy();
  });

  it("renders the initial set number", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});
    expect(screen.getByText("Set 1")).toBeTruthy();
  });

  it("renders weight and reps inputs", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});
    expect(screen.getAllByPlaceholderText("0")).toHaveLength(2);
  });

  it("renders LOG SET button", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});
    expect(screen.getByText("LOG SET")).toBeTruthy();
  });

  it("renders FINISH EXERCISE button", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});
    expect(screen.getByText("FINISH EXERCISE")).toBeTruthy();
  });

  it("renders failure toggle", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});
    expect(screen.getByText("TAKEN TO FAILURE?")).toBeTruthy();
  });

  it("shows Exercise not found for invalid exerciseId", async () => {
    mockUseLocalSearchParams.mockReturnValue({ exerciseId: "nonexistent" });
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});
    expect(screen.getByText("Exercise not found")).toBeTruthy();
  });

  it("toggles failure state", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});

    fireEvent.press(screen.getByText("TAKEN TO FAILURE?"));
    expect(screen.getByText("FAILURE ✓")).toBeTruthy();

    fireEvent.press(screen.getByText("FAILURE ✓"));
    expect(screen.getByText("TAKEN TO FAILURE?")).toBeTruthy();
  });

  it("does not render completed sets section initially", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});
    expect(screen.queryByText("COMPLETED SETS")).toBeNull();
  });

  it("logs a set and shows it in completed sets", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});

    const inputs = screen.getAllByPlaceholderText("0");
    fireEvent.changeText(inputs[0], "135");
    fireEvent.changeText(inputs[1], "10");

    fireEvent.press(screen.getByText("LOG SET"));

    expect(screen.getByText("COMPLETED SETS")).toBeTruthy();
    expect(screen.getByText("135 lbs")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
  });

  it("increments set number after logging a set", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});

    const inputs = screen.getAllByPlaceholderText("0");
    fireEvent.changeText(inputs[0], "135");
    fireEvent.changeText(inputs[1], "10");
    fireEvent.press(screen.getByText("LOG SET"));

    expect(screen.getByText("Set 2")).toBeTruthy();
  });

  it("logs failure flag on a set", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});

    fireEvent.press(screen.getByText("TAKEN TO FAILURE?"));
    const inputs = screen.getAllByPlaceholderText("0");
    fireEvent.changeText(inputs[0], "225");
    fireEvent.changeText(inputs[1], "6");
    fireEvent.press(screen.getByText("LOG SET"));

    expect(screen.getByText("✓")).toBeTruthy();
  });

  it("calls finishExercise and navigates back on FINISH EXERCISE", async () => {
    mockFinishExercise.mockResolvedValue(undefined);

    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});

    const inputs = screen.getAllByPlaceholderText("0");
    fireEvent.changeText(inputs[0], "135");
    fireEvent.changeText(inputs[1], "10");

    await act(async () => {
      fireEvent.press(screen.getByText("FINISH EXERCISE"));
    });

    expect(mockFinishExercise).toHaveBeenCalledWith("incline-bench-press", [
      { id: 1, weight: 135, reps: 10, failure: false },
    ]);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("navigates back even with no sets logged", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});

    await act(async () => {
      fireEvent.press(screen.getByText("FINISH EXERCISE"));
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockFinishExercise).not.toHaveBeenCalled();
  });

  it("navigates back when Cancel is pressed", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});

    fireEvent.press(screen.getByText("Cancel"));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockFinishExercise).not.toHaveBeenCalled();
  });

  it("renders the rest timer at its default duration", async () => {
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});
    expect(screen.getByText("REST 1:00")).toBeTruthy();
  });

  it("starts counting down when the rest timer is pressed", async () => {
    jest.useFakeTimers();
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});

    fireEvent.press(screen.getByText("REST 1:00"));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("REST 0:59")).toBeTruthy();
  });

  it("restarts the rest timer when pressed again", async () => {
    jest.useFakeTimers();
    render(<ExerciseTracker />, { wrapper: TestWrapper });
    await act(async () => {});

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

  describe("Last Time section", () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ exerciseId: "cable-chest-press" });
    });

    it("does not render when there is no previous performance", async () => {
      mockGetLastExercisePerformance.mockResolvedValue(null);

      render(<ExerciseTracker />, { wrapper: TestWrapper });
      await act(async () => {});

      expect(screen.queryByText(/LAST TIME/)).toBeNull();
    });

    it("renders a collapsed trigger with the previous date when history exists", async () => {
      mockGetLastExercisePerformance.mockResolvedValue({
        date: "2026-08-15",
        exercise: {
          id: "cable-chest-press",
          name: "Cable Chest Press",
          muscleGroup: "chest",
          sets: [{ id: 1, weight: 100, reps: 10, failure: false }],
        },
      });

      render(<ExerciseTracker />, { wrapper: TestWrapper });
      await act(async () => {});

      expect(screen.getByText(/LAST TIME/)).toBeTruthy();
      expect(screen.queryByText("100 lbs")).toBeNull();
    });

    it("expands to show the set table when the trigger is pressed", async () => {
      mockGetLastExercisePerformance.mockResolvedValue({
        date: "2026-08-15",
        exercise: {
          id: "cable-chest-press",
          name: "Cable Chest Press",
          muscleGroup: "chest",
          sets: [
            { id: 1, weight: 100, reps: 10, failure: false },
            { id: 2, weight: 95, reps: 8, failure: true },
          ],
        },
      });

      render(<ExerciseTracker />, { wrapper: TestWrapper });
      await act(async () => {});

      fireEvent.press(screen.getByText(/LAST TIME/));

      expect(screen.getByText("100 lbs")).toBeTruthy();
      expect(screen.getByText("95 lbs")).toBeTruthy();
      expect(screen.getByText("✓")).toBeTruthy();
    });
  });
});
