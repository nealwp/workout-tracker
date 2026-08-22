import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { TestWrapper } from "./helpers/TestWrapper";

jest.mock("@/lib/secureStore", () => ({
  tokenStore: {
    getAccessToken: jest.fn().mockResolvedValue(null),
    setAccessToken: jest.fn(),
    getRefreshToken: jest.fn().mockResolvedValue(null),
    setRefreshToken: jest.fn(),
    clearAll: jest.fn(),
  },
}));

jest.mock("@/lib/api/client", () => ({
  signInWithGoogle: jest.fn(),
  fetchMe: jest.fn(),
  signOutServer: jest.fn(),
}));

function TestChild() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Text>loading</Text>;
  return <Text>{user ? user.name : "no user"}</Text>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows no user after loading with no session", async () => {
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>,
      { wrapper: TestWrapper }
    );

    const text = await screen.findByText("no user");
    expect(text).toBeTruthy();
  });

  it("does not show user name when not authenticated", async () => {
    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>,
      { wrapper: TestWrapper }
    );

    await screen.findByText("no user");
    expect(screen.queryByText("Test User")).toBeNull();
  });
});
