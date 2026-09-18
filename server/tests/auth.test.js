const test = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

// These tests check the core auth LOGIC in isolation, without needing a
// real MongoDB connection. Testing the full register/login HTTP routes
// end-to-end (Stage 26 in your spec) needs a real or in-memory database —
// we'll add that once we set up a dedicated test database, rather than
// faking one now.

test("password hashing: a hashed password should never equal the plain password", async () => {
  const plainPassword = "mySecret123";
  const hashed = await bcrypt.hash(plainPassword, 10);
  assert.notStrictEqual(hashed, plainPassword);
});

test("password hashing: bcrypt.compare correctly verifies a matching password", async () => {
  const plainPassword = "mySecret123";
  const hashed = await bcrypt.hash(plainPassword, 10);
  const matches = await bcrypt.compare(plainPassword, hashed);
  assert.strictEqual(matches, true);
});

test("password hashing: bcrypt.compare rejects a wrong password", async () => {
  const hashed = await bcrypt.hash("mySecret123", 10);
  const matches = await bcrypt.compare("wrongPassword", hashed);
  assert.strictEqual(matches, false);
});

test("generateToken: produces a token that decodes back to the same user id", () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_for_this_run";
  const fakeUserId = "64f1a2b3c4d5e6f7a8b9c0d1";
  const token = generateToken(fakeUserId);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.strictEqual(decoded.id, fakeUserId);
});
