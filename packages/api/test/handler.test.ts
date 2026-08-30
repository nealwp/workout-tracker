process.env.AWS_LAMBDA_FUNCTION_NAME = "test";
process.env.JWT_SECRET = "test-secret";

import { before, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { __resetForTests as resetWorkouts } from "../src/storage/memory/workouts";

type Handler = (event: Record<string, unknown>) => Promise<{ statusCode: number; body: string }>;

let handler: Handler;

before(async () => {
  await resetWorkouts();
  const mod = await import("../src/index");
  handler = mod.handler as Handler;
});

function getAuthHeaders(userId: string): Record<string, string> {
  const token = jwt.sign({ userId, email: "test@example.com" }, "test-secret", {
    expiresIn: "15m",
  });
  return { authorization: `Bearer ${token}` };
}

function parseBody(res: { statusCode: number; body: string }) {
  return JSON.parse(res.body) as Record<string, unknown>;
}

function event(method: string, path: string, extra: Record<string, unknown> = {}) {
  return {
    version: "2.0",
    routeKey: `${method} ${path.split("?")[0]}`,
    rawPath: path.split("?")[0],
    rawQueryString: path.includes("?") ? path.split("?")[1] : "",
    headers: extra.headers ?? {},
    requestContext: { http: { method, path: path.split("?")[0] } },
    isBase64Encoded: false,
    ...extra,
  };
}

describe("handler", { concurrency: 1 }, () => {
  beforeEach(async () => {
    await resetWorkouts();
  });

  test("GET /health returns 200 ok", async () => {
    const res = await handler(event("GET", "/health"));
    assert.equal(res.statusCode, 200);
    assert.deepEqual(parseBody(res), { status: "ok" });
  });

  test("POST /auth/google parses the JSON body", async () => {
    const res = await handler(event("POST", "/auth/google", {
      headers: { "content-type": "application/json", origin: "https://www.irondog.fit" },
      body: JSON.stringify({ idToken: "garbage" }),
    }));
    assert.equal(res.statusCode, 401);
    assert.deepEqual(parseBody(res), { error: "Invalid Google token" });
  });

  test("GET /workouts/today returns 400 when date is missing", async () => {
    const headers = getAuthHeaders("handler-user-no-date");
    const res = await handler(event("GET", "/workouts/today", { headers }));
    assert.equal(res.statusCode, 400);
    assert.equal(parseBody(res).error, "Missing or invalid date parameter (YYYY-MM-DD format)");
  });

  test("GET /workouts/today returns 404 when no workout exists", async () => {
    const headers = getAuthHeaders("handler-user-no-workout");
    const date = new Date().toISOString().slice(0, 10);
    const res = await handler(event("GET", `/workouts/today?date=${date}`, { headers }));
    assert.equal(res.statusCode, 404);
    assert.equal(parseBody(res).error, "No workout for today");
  });

  test("POST /workouts returns 400 when date is missing", async () => {
    const headers = getAuthHeaders("handler-user-no-date-post");
    const res = await handler(event("POST", "/workouts", { headers, body: JSON.stringify({}) }));
    assert.equal(res.statusCode, 400);
    assert.equal(parseBody(res).error, "Missing or invalid date parameter (YYYY-MM-DD format)");
  });

  test("GET /workouts/today returns the workout for the current day", async () => {
    const headers = getAuthHeaders("handler-user-with-workout-unique");
    const date = "2025-12-31";
    
    const createRes = await handler(event("POST", "/workouts", {
      headers,
      body: JSON.stringify({ date }),
    }));
    assert.equal(createRes.statusCode, 201);
    const createdWorkout = parseBody(createRes);

    const getRes = await handler(event("GET", `/workouts/today?date=${date}`, { headers }));
    assert.equal(getRes.statusCode, 200);
    const foundWorkout = parseBody(getRes);
    
    assert.equal(foundWorkout.id, createdWorkout.id);
    assert.equal(foundWorkout.date, date);
  });
});