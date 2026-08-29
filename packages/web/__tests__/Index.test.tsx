import React from "react";
import { render, fireEvent, act, screen } from "@testing-library/react-native";
import Index from "../app/index";
import { useWorkout } from "../context/WorkoutContext";
import { useAuth } from "../context/AuthContext";
import { TestWrapper } from "./helpers/TestWrapper";

const mockPush = jest.fn();
const mockStartWorkout = jest.fn();
const mockSignIn = jest.fn();
const mockPromptAsync = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Fontisto: "Fontisto",
}));

jest.mock("expo-auth-session", () => ({
  useAuthRequest: () => [null, null, mockPromptAsync],
  makeRedirectUri: () => "https://expo.dev/@placeholder/redirect",
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("../context/WorkoutContext", () => ({
  useWorkout: jest.fn(),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/secureStore", () => ({
  tokenStore: {
    getAccessToken: jest.fn().mockResolvedValue(null),
    setAccessToken: jest.fn(),
    getRefreshToken: jest.fn().mockResolvedValue(null),
    setRefreshToken: jest.fn(),
    clearAll: jest.fn(),
  },
}));

const mockUseWorkout = useWorkout as jest.MockedFunction<typeof useWorkout>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseWorkout.mockReturnValue({
    workoutKey: null,
    completedExercises: [],
    startWorkout: mockStartWorkout,
    finishExercise: jest.fn(),
  });
  mockUseAuth.mockReturnValue({
    user: null,
    isLoading: false,
    signIn: mockSignIn,
    signOut: jest.fn(),
  });
});

describe("Index Screen", () => {
  it("renders the tagline", () => {
    render(<Index />, { wrapper: TestWrapper });
    expect(screen.getByText("Hypertrophy & Progressive Overload")).toBeTruthy();
  });

  it("renders sign in button when not authenticated", () => {
    render(<Index />, { wrapper: TestWrapper });
    expect(screen.getByText("Sign in with Google")).toBeTruthy();
  });

  it("does not show LFG button when not authenticated", () => {
    render(<Index />, { wrapper: TestWrapper });
    expect(screen.queryByText("LFG")).toBeNull();
  });

  it("renders LFG button when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "test@gmail.com", name: "Test User", avatarUrl: null },
      isLoading: false,
      signIn: mockSignIn,
      signOut: jest.fn(),
    });

    render(<Index />, { wrapper: TestWrapper });
    expect(screen.getByText("LFG")).toBeTruthy();
  });

  it("renders greeting when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "test@gmail.com", name: "Test User", avatarUrl: null },
      isLoading: false,
      signIn: mockSignIn,
      signOut: jest.fn(),
    });

    render(<Index />, { wrapper: TestWrapper });
    expect(screen.getByText("Hi, Test User")).toBeTruthy();
  });

  it("calls startWorkout and navigates to select-exercise when LFG is pressed", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "test@gmail.com", name: "Test User", avatarUrl: null },
      isLoading: false,
      signIn: mockSignIn,
      signOut: jest.fn(),
    });
    mockStartWorkout.mockResolvedValue(undefined);

    render(<Index />, { wrapper: TestWrapper });

    await act(async () => {
      fireEvent.press(screen.getByText("LFG"));
    });

    expect(mockStartWorkout).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/workout/select-exercise");
  });

  it("does not render tap to start text when not authenticated", () => {
    render(<Index />, { wrapper: TestWrapper });
    expect(screen.queryByText("Tap to start today's workout")).toBeNull();
  });
});
