import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { GoogleUserInfo } from "../src/storage/types";
import {
  createUser,
  findOrCreateUser,
  getUserById,
  getUserByGoogleId,
  __resetForTests,
} from "../src/storage/memory/users";

const baseInfo: GoogleUserInfo = {
  googleId: "google-123",
  email: "user@example.com",
  name: "User Name",
  avatarUrl: null,
};

before(async () => {
  await __resetForTests();
});

describe("memory users", () => {
  beforeEach(async () => {
    await __resetForTests();
  });

  it("creates a user", async () => {
    const user = await createUser(baseInfo);
    assert.ok(user.id);
    assert.equal(user.googleId, "google-123");
    assert.equal(user.email, "user@example.com");
    assert.equal(user.name, "User Name");
    assert.ok(user.createdAt);
  });

  it("gets a user by id", async () => {
    const created = await createUser(baseInfo);
    const found = await getUserById(created.id);
    assert.deepEqual(found, created);
  });

  it("gets a user by google id", async () => {
    await createUser(baseInfo);
    const found = await getUserByGoogleId("google-123");
    assert.equal(found?.email, "user@example.com");
  });

  it("returns undefined for unknown user id", async () => {
    const found = await getUserById("does-not-exist");
    assert.equal(found, undefined);
  });

  it("findOrCreateUser returns existing user for same google id", async () => {
    const first = await findOrCreateUser(baseInfo);
    const second = await findOrCreateUser(baseInfo);
    assert.equal(second.id, first.id);
    const all = [await getUserByGoogleId("google-123")];
    assert.equal(all[0]?.id, first.id);
  });
});
