import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Workout, ExerciseData, User, AuthPayload } from "./types";

const app = express();
const PORT = 3001;
const JWT_SECRET = crypto.randomBytes(32).toString("hex");
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

app.use(cors());
app.use(express.json());

const users: User[] = [];
const workouts: Workout[] = [];
const refreshTokens = new Map<string, string>();

const jwksClientInstance = jwksClient({
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
  cache: true,
  rateLimit: true,
});

function getGoogleSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    jwksClientInstance.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key!.getPublicKey());
    });
  });
}

async function verifyGoogleToken(idToken: string) {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header.kid) throw new Error("Invalid token");

  const publicKey = await getGoogleSigningKey(decoded.header.kid);
  const payload = jwt.verify(idToken, publicKey, {
    audience: GOOGLE_WEB_CLIENT_ID,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  }) as jwt.JwtPayload;

  return {
    googleId: payload.sub!,
    email: payload.email!,
    name: payload.name ?? "",
    avatarUrl: (payload as Record<string, unknown>).picture as string | null ?? null,
  };
}

function signTokens(authPayload: AuthPayload) {
  const accessToken = jwt.sign(authPayload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(authPayload, JWT_SECRET, { expiresIn: "30d" });
  return { accessToken, refreshToken };
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

app.post("/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ error: "Missing idToken" });
      return;
    }

    const googleUser = await verifyGoogleToken(idToken);

    let user = users.find((u) => u.googleId === googleUser.googleId);
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.avatarUrl,
        googleId: googleUser.googleId,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
    }

    const tokens = signTokens({ userId: user.id, email: user.email });
    refreshTokens.set(tokens.refreshToken, user.id);

    res.status(201).json({
      ...tokens,
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    });
  } catch {
    res.status(401).json({ error: "Invalid Google token" });
  }
});

app.post("/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as AuthPayload;
    refreshTokens.delete(refreshToken);

    const tokens = signTokens({ userId: payload.userId, email: payload.email });
    refreshTokens.set(tokens.refreshToken, payload.userId);

    res.json(tokens);
  } catch {
    refreshTokens.delete(refreshToken);
    res.status(401).json({ error: "Refresh token expired" });
  }
});

app.post("/auth/logout", (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) refreshTokens.delete(refreshToken);
  res.json({ success: true });
});

app.get("/auth/me", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl });
});

app.get("/workouts", requireAuth, (req, res) => {
  const userWorkouts = workouts.filter((w) => w.userId === req.userId);
  res.json(userWorkouts);
});

app.get("/workouts/:id", requireAuth, (req, res) => {
  const workout = workouts.find((w) => w.id === req.params.id && w.userId === req.userId);
  if (!workout) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }
  res.json(workout);
});

app.post("/workouts", requireAuth, (req, res) => {
  const workout: Workout = {
    id: crypto.randomUUID(),
    userId: req.userId!,
    date: new Date().toISOString(),
    exercises: [],
  };
  workouts.push(workout);
  res.status(201).json(workout);
});

app.post("/workouts/:id/exercises", requireAuth, (req, res) => {
  const workout = workouts.find((w) => w.id === req.params.id && w.userId === req.userId);
  if (!workout) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }

  const exercise: ExerciseData = {
    id: req.body.id,
    name: req.body.name,
    muscleGroup: req.body.muscleGroup,
    sets: req.body.sets || [],
  };

  workout.exercises.push(exercise);
  res.status(201).json(exercise);
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
});
