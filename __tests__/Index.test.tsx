import React from "react";
import { render, fireEvent, act, screen } from "@testing-library/react-native";
import Index from "../app/index";
import { useWorkout } from "../context/WorkoutContext";
import { TestWrapper } from "./helpers/TestWrapper";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("../context/WorkoutContext", () => ({
  useWorkout: jest.fn(),
}));

const mockStartWorkout = jest.fn();
const mockUseWorkout = useWorkout as jest.MockedFunction<typeof useWorkout>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseWorkout.mockReturnValue({
    workoutId: null,
    completedExercises: [],
    startWorkout: mockStartWorkout,
    finishExercise: jest.fn(),
  });
});

describe("Index Screen", () => {
  it("renders the title", () => {
    render(<Index />, { wrapper: TestWrapper });
    expect(screen.getByText("WORKOUT TRACKER")).toBeTruthy();
  });

  it("renders the subtitle", () => {
    render(<Index />, { wrapper: TestWrapper });
    expect(screen.getByText("Hypertrophy & Progressive Overload")).toBeTruthy();
  });

  it("renders the LFG button", () => {
    render(<Index />, { wrapper: TestWrapper });
    expect(screen.getByText("LFG")).toBeTruthy();
  });

  it("renders the tap instruction", () => {
    render(<Index />, { wrapper: TestWrapper });
    expect(screen.getByText("Tap to start today's workout")).toBeTruthy();
  });

  it("calls startWorkout when LFG button is pressed", async () => {
    mockStartWorkout.mockResolvedValue(undefined);

    render(<Index />, { wrapper: TestWrapper });

    await act(async () => {
      fireEvent.press(screen.getByText("LFG"));
    });

    expect(mockStartWorkout).toHaveBeenCalledTimes(1);
  });
});
