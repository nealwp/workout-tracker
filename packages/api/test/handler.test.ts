process.env.AWS_LAMBDA_FUNCTION_NAME = "test";

import { before, test } from "node:test";
import assert from "node:assert/strict";

type Handler = (event: Record<string, unknown>) => Promise<{ statusCode: number; body: string }>;

let handler: Handler;

before(async () => {
  const mod = await import("../src/index");
  handler = mod.handler as Handler;
});

function parseBody(res: { statusCode: number; body: string }) {
  return JSON.parse(res.body) as Record<string, unknown>;
}

test("GET /health returns 200 ok", async () => {
  const res = await handler({
    version: "2.0",
    routeKey: "GET /health",
    rawPath: "/health",
    rawQueryString: "",
    headers: {},
    requestContext: { http: { method: "GET", path: "/health" } },
    isBase64Encoded: false,
  });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(parseBody(res), { status: "ok" });
});

test("POST /auth/google parses the JSON body", async () => {
  const res = await handler({
    version: "2.0",
    routeKey: "POST /auth/google",
    rawPath: "/auth/google",
    rawQueryString: "",
    headers: { "content-type": "application/json", origin: "https://www.irondog.fit" },
    requestContext: { http: { method: "POST", path: "/auth/google" } },
    body: JSON.stringify({ idToken: "garbage" }),
    isBase64Encoded: false,
  });
  assert.equal(res.statusCode, 401);
  assert.deepEqual(parseBody(res), { error: "Invalid Google token" });
});