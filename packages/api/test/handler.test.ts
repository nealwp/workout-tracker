process.env.AWS_LAMBDA_FUNCTION_NAME = "test";
process.env.JWT_SECRET = "test-secret";
// AWS_LAMBDA_FUNCTION_NAME above only exists to stop the handler from calling
// app.listen(); it also happens to be what getStorage() uses to detect a real
// Lambda runtime and switch to DynamoDB. Force memory storage explicitly so
// these tests never touch real AWS infrastructure (which is flaky/fails
// without credentials, e.g. in CI).
process.env.STORAGE = "memory";

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
    const date = new Date().toLocaleDateString("en-CA");
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

  test("GET /workouts/exercise/:exerciseId/last returns 404 when no history exists", async () => {
    const headers = getAuthHeaders("handler-user-no-exercise-history");
    const res = await handler(
      event("GET", "/workouts/exercise/bench-press/last", { headers })
    );
    assert.equal(res.statusCode, 404);
    assert.equal(parseBody(res).error, "No previous workout found for this exercise");
  });

  test("GET /workouts/exercise/:exerciseId/last returns the most recent matching exercise", async () => {
    const headers = getAuthHeaders("handler-user-exercise-history");

    const olderRes = await handler(
      event("POST", "/workouts", { headers, body: JSON.stringify({ date: "2026-08-01" }) })
    );
    const olderWorkout = parseBody(olderRes);
    await handler(
      event("POST", `/workouts/${olderWorkout.id}/exercises`, {
        headers,
        body: JSON.stringify({
          id: "bench-press",
          name: "Bench Press",
          muscleGroup: "chest",
          sets: [{ id: 1, weight: 100, reps: 8, failure: false }],
        }),
      })
    );

    const newerRes = await handler(
      event("POST", "/workouts", { headers, body: JSON.stringify({ date: "2026-08-15" }) })
    );
    const newerWorkout = parseBody(newerRes);
    await handler(
      event("POST", `/workouts/${newerWorkout.id}/exercises`, {
        headers,
        body: JSON.stringify({
          id: "bench-press",
          name: "Bench Press",
          muscleGroup: "chest",
          sets: [
            { id: 1, weight: 110, reps: 6, failure: false },
            { id: 2, weight: 110, reps: 5, failure: true },
          ],
        }),
      })
    );

    const res = await handler(
      event("GET", "/workouts/exercise/bench-press/last", { headers })
    );
    assert.equal(res.statusCode, 200);
    const body = parseBody(res);
    assert.equal(body.date, "2026-08-15");
    assert.deepEqual(body.exercise, {
      id: "bench-press",
      name: "Bench Press",
      muscleGroup: "chest",
      sets: [
        { id: 1, weight: 110, reps: 6, failure: false },
        { id: 2, weight: 110, reps: 5, failure: true },
      ],
    });
  });

  test("GET /workouts/today returns the workout for the current day", async () => {
    const headers = getAuthHeaders("handler-user-with-workout-unique");
    const date = new Date().toLocaleDateString("en-CA");
    
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

  test("GET /workouts pages through workouts with limit and cursor", async () => {
    const headers = getAuthHeaders("handler-user-paged");

    for (const day of ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05"]) {
      const createRes = await handler(event("POST", "/workouts", { headers, body: JSON.stringify({ date: day }) }));
      assert.equal(createRes.statusCode, 201);
    }

    const firstRes = await handler(event("GET", "/workouts?limit=2", { headers }));
    assert.equal(firstRes.statusCode, 200);
    const firstPage = parseBody(firstRes) as { items: { date: string }[]; nextCursor: string | null };
    assert.equal(firstPage.items.length, 2);
    assert.deepEqual(firstPage.items.map((w) => w.date), ["2026-08-05", "2026-08-04"]);
    assert.ok(firstPage.nextCursor);

    const secondRes = await handler(
      event("GET", `/workouts?limit=2&cursor=${encodeURIComponent(firstPage.nextCursor!)}`, { headers })
    );
    const secondPage = parseBody(secondRes) as { items: { date: string }[]; nextCursor: string | null };
    assert.equal(secondPage.items.length, 2);
    assert.deepEqual(secondPage.items.map((w) => w.date), ["2026-08-03", "2026-08-02"]);

    const thirdRes = await handler(
      event("GET", `/workouts?limit=2&cursor=${encodeURIComponent(secondPage.nextCursor!)}`, { headers })
    );
    const thirdPage = parseBody(thirdRes) as { items: { date: string }[]; nextCursor: string | null };
    assert.equal(thirdPage.items.length, 1);
    assert.equal(thirdPage.items[0].date, "2026-08-01");
    assert.equal(thirdPage.nextCursor, null);
  });
});