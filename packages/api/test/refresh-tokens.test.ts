import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  storeRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  hashRefreshToken,
  __resetForTests,
} from "../src/storage/memory/refresh-tokens";

before(async () => {
  await __resetForTests();
});

describe("memory refresh tokens", () => {
  beforeEach(async () => {
    await __resetForTests();
  });

  it("stores the hashed token rather than the raw token", async () => {
    const raw = "raw-refresh-token";
    await storeRefreshToken(raw, "user-1", 1788048000);
    const record = await getRefreshToken(raw);
    assert.equal(record?.tokenHash, hashRefreshToken(raw));
    assert.notEqual(record?.tokenHash, raw);
  });

  it("retrieves a token using a raw presented token", async () => {
    await storeRefreshToken("raw-token", "user-1", 1788048000);
    const record = await getRefreshToken("raw-token");
    assert.equal(record?.userId, "user-1");
  });

  it("deletes/revokes a token", async () => {
    await storeRefreshToken("raw-token", "user-1", 1788048000);
    await deleteRefreshToken("raw-token");
    assert.equal(await getRefreshToken("raw-token"), undefined);
  });

  it("persists the TTL value correctly", async () => {
    await storeRefreshToken("raw-token", "user-1", 1788048000);
    const record = await getRefreshToken("raw-token");
    assert.equal(record?.expiresAt, 1788048000);
  });
});
