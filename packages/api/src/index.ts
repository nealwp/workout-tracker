import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import serverless from "serverless-http";
import type { AuthPayload, ExerciseData, Workout } from "@irondog/shared";
import { getStorage, createWorkoutKey } from "./storage";
import { logger } from "./logger";

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const storage = getStorage();
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

app.use(
  cors({
    origin: [
      "https://irondog.fit",
      "https://www.irondog.fit",
      "http://localhost:8081",
      "http://127.0.0.1:8081",
    ],
  })
);
app.use(express.json());
// serverless-http 3.x fakes the request socket (readable:false, complete:true),
// so on-finished reports the request "already finished" and Express 5's
// express.json() skips parsing -- req.body stays the raw JSON string.
// TODO: replace Express+serverless-http with Hono (@hono/aws-lambda) to
// eliminate this class of bug.
app.use((req, _res, next) => {
  const raw = req.body;
  if (typeof raw === "string" || Buffer.isBuffer(raw)) {
    try {
      req.body = JSON.parse(raw.toString());
    } catch {
      req.body = {};
    }
  }
  next();
});

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
  } catch (err) {
    logger.warn("auth failed", { path: req.path, method: req.method }, err);
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

function withWorkoutKey(workout: Workout) {
  return { ...workout, workoutKey: createWorkoutKey(workout.date, workout.id) };
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ error: "Missing idToken" });
      return;
    }

    const googleUser = await verifyGoogleToken(idToken);
    const user = await storage.findOrCreateUser(googleUser);

    const tokens = signTokens({ userId: user.id, email: user.email });
    await storage.storeRefreshToken(
      tokens.refreshToken,
      user.id,
      Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL_SECONDS
    );

    res.status(201).json({
      ...tokens,
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    logger.error("google auth failed", { path: req.path }, err);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

app.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !(await storage.getRefreshToken(refreshToken))) {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as AuthPayload;
    await storage.deleteRefreshToken(refreshToken);

    const tokens = signTokens({ userId: payload.userId, email: payload.email });
    await storage.storeRefreshToken(
      tokens.refreshToken,
      payload.userId,
      Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL_SECONDS
    );

    res.json(tokens);
  } catch (err) {
    await storage.deleteRefreshToken(refreshToken).catch(() => {});
    logger.warn("refresh token expired or invalid", { path: req.path }, err);
    res.status(401).json({ error: "Refresh token expired" });
  }
});

app.post("/auth/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await storage.deleteRefreshToken(refreshToken);
  res.json({ success: true });
});

app.get("/auth/me", requireAuth, async (req, res) => {
  const user = await storage.getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl });
});

app.get("/workouts", requireAuth, async (req, res) => {
  const userWorkouts = await storage.listWorkouts(req.userId!);
  res.json(userWorkouts.map(withWorkoutKey));
});

app.get("/workouts/:workoutKey", requireAuth, async (req, res) => {
  const workout = await storage.getWorkout(req.userId!, req.params.workoutKey as string);
  if (!workout) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }
  res.json(withWorkoutKey(workout));
});

app.post("/workouts", requireAuth, async (req, res) => {
  const workout = await storage.createWorkout(req.userId!);
  res.status(201).json(withWorkoutKey(workout));
});

app.post("/workouts/:workoutKey/exercises", requireAuth, async (req, res) => {
  const workout = await storage.getWorkout(req.userId!, req.params.workoutKey as string);
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

  const savedWorkout: Workout = { ...workout, exercises: [...workout.exercises, exercise] };
  await storage.saveWorkout(savedWorkout);
  res.status(201).json(exercise);
});

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("unhandled route error", { path: req.path, method: req.method, userId: req.userId }, err);
  res.status(500).json({ error: "Internal server error" });
});

export const handler = serverless(app);

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
  });
}