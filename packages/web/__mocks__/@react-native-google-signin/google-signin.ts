export const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn().mockResolvedValue(true),
  signIn: jest.fn().mockResolvedValue({
    idToken: "mock-id-token",
    user: { name: "Test User", email: "test@gmail.com" },
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  isSignedIn: jest.fn().mockResolvedValue(false),
  getTokens: jest.fn().mockResolvedValue({ idToken: "mock-id-token" }),
};
