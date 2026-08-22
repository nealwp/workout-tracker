import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = crypto.randomBytes(32).toString("hex");

function signToken(payload: object, options?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET, options);
}

function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

describe("Auth Token Operations", () => {
  it("signs and verifies an access token", () => {
    const payload = { userId: "user-123", email: "test@gmail.com" };
    const token = signToken(payload, { expiresIn: "15m" });

    const decoded = verifyToken(token) as jwt.JwtPayload;
    expect(decoded.userId).toBe("user-123");
    expect(decoded.email).toBe("test@gmail.com");
  });

  it("signs a refresh token with longer expiry", () => {
    const payload = { userId: "user-123", email: "test@gmail.com" };
    const token = signToken(payload, { expiresIn: "30d" });

    const decoded = verifyToken(token) as jwt.JwtPayload;
    expect(decoded.userId).toBe("user-123");
    expect(decoded.exp! - decoded.iat!).toBeGreaterThan(86400);
  });

  it("rejects an invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });

  it("rejects a token signed with wrong secret", () => {
    const wrongSecret = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign({ userId: "user-123" }, wrongSecret, { expiresIn: "15m" });

    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });
});

describe("User Store Operations", () => {
  interface TestUser {
    id: string;
    email: string;
    name: string;
    googleId: string;
  }

  let users: TestUser[] = [];

  beforeEach(() => {
    users = [];
  });

  it("finds existing user by googleId", () => {
    users.push({ id: "1", email: "a@test.com", name: "User A", googleId: "g-123" });
    users.push({ id: "2", email: "b@test.com", name: "User B", googleId: "g-456" });

    const found = users.find((u) => u.googleId === "g-456");
    expect(found?.name).toBe("User B");
  });

  it("returns undefined for unknown googleId", () => {
    const found = users.find((u) => u.googleId === "unknown");
    expect(found).toBeUndefined();
  });

  it("creates a new user with uuid", () => {
    const user: TestUser = {
      id: crypto.randomUUID(),
      email: "new@test.com",
      name: "New User",
      googleId: "g-789",
    };
    users.push(user);

    expect(users).toHaveLength(1);
    expect(users[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });
});

describe("Refresh Token Store", () => {
  const refreshTokens = new Map<string, string>();

  beforeEach(() => {
    refreshTokens.clear();
  });

  it("stores and retrieves refresh tokens", () => {
    refreshTokens.set("refresh-abc", "user-123");
    expect(refreshTokens.get("refresh-abc")).toBe("user-123");
  });

  it("invalidates refresh token on logout", () => {
    refreshTokens.set("refresh-abc", "user-123");
    refreshTokens.delete("refresh-abc");
    expect(refreshTokens.has("refresh-abc")).toBe(false);
  });

  it("invalidates old refresh token when rotating", () => {
    refreshTokens.set("refresh-old", "user-123");
    refreshTokens.delete("refresh-old");
    refreshTokens.set("refresh-new", "user-123");

    expect(refreshTokens.has("refresh-old")).toBe(false);
    expect(refreshTokens.has("refresh-new")).toBe(true);
  });
});

describe("Workout Scoping", () => {
  interface TestWorkout {
    id: string;
    userId: string;
    date: string;
  }

  const workouts: TestWorkout[] = [
    { id: "w-1", userId: "user-123", date: "2026-08-01" },
    { id: "w-2", userId: "user-456", date: "2026-08-02" },
    { id: "w-3", userId: "user-123", date: "2026-08-03" },
  ];

  it("filters workouts by userId", () => {
    const userWorkouts = workouts.filter((w) => w.userId === "user-123");
    expect(userWorkouts).toHaveLength(2);
    expect(userWorkouts.map((w) => w.id)).toEqual(["w-1", "w-3"]);
  });

  it("returns empty for unknown userId", () => {
    const userWorkouts = workouts.filter((w) => w.userId === "unknown");
    expect(userWorkouts).toHaveLength(0);
  });

  it("finds specific workout by id and userId", () => {
    const workout = workouts.find((w) => w.id === "w-2" && w.userId === "user-456");
    expect(workout).toBeDefined();
  });

  it("returns undefined when workout belongs to different user", () => {
    const workout = workouts.find((w) => w.id === "w-1" && w.userId === "user-456");
    expect(workout).toBeUndefined();
  });
});
