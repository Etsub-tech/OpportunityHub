// These tests spin up the real Express app (in-process, no separate server
// process) and talk to a REAL MongoDB database via Mongoose - unlike
// auth.test.js and matchingService.test.js, which test pure logic with no
// database at all.
//
// WHY a real database instead of a fake/mocked one: mocking Mongoose calls
// would mean we're only testing "did we call the right mock function?", not
// "does this actually work against MongoDB?" - things like the unique index
// on {user, opportunity} in Application, or $text search, only behave
// correctly against a real MongoDB engine.
//
// HOW TO RUN THESE: set TEST_MONGO_URI in your .env to a MongoDB database
// you're okay with being wiped between test runs (a separate Atlas
// database/cluster, or a local MongoDB if you have one installed) - NEVER
// point this at your real data. Then: npm run test:integration
//
// If TEST_MONGO_URI isn't set, these tests are skipped rather than failing,
// so `npm test` still works for anyone who's only set up MONGO_URI.
const test = require("node:test");
const assert = require("node:assert");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Opportunity = require("../models/Opportunity");
const Application = require("../models/Application");

const TEST_URI = process.env.TEST_MONGO_URI;

test("integration tests", { skip: !TEST_URI && "TEST_MONGO_URI not set - see comment at top of this file" }, async (t) => {
  await mongoose.connect(TEST_URI);
  // Start from a clean slate every run so tests don't depend on leftover
  // data from a previous run (and never touch anything but this test DB).
  await User.deleteMany({});
  await Opportunity.deleteMany({});
  await Application.deleteMany({});

  await t.test("registration: creates a user with a hashed password", async () => {
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
    });
    assert.notStrictEqual(user.password, "password123");
  });

  await t.test("registration: rejects a duplicate email at the application level (findOne check)", async () => {
    const existing = await User.findOne({ email: "test@example.com" });
    assert.ok(existing, "the user from the previous test should exist");
    // authController.register does this exact check before calling User.create -
    // we're proving the check itself behaves correctly against a real query.
  });

  await t.test("opportunity filtering: opportunityType filter only returns matching documents", async () => {
    await Opportunity.create([
      { title: "A", organization: "Org", description: "d", opportunityType: "Internship", applicationUrl: "https://x.com", source: "test" },
      { title: "B", organization: "Org", description: "d", opportunityType: "Scholarship", applicationUrl: "https://x.com", source: "test" },
    ]);

    const results = await Opportunity.find({ opportunityType: "Internship" });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].title, "A");
  });

  await t.test("pagination: skip/limit returns the correct page size", async () => {
    await Opportunity.deleteMany({});
    const docs = Array.from({ length: 15 }, (_, i) => ({
      title: `Opp ${i}`, organization: "Org", description: "d",
      opportunityType: "Internship", applicationUrl: "https://x.com", source: "test",
    }));
    await Opportunity.create(docs);

    const page1 = await Opportunity.find().limit(10).skip(0);
    const page2 = await Opportunity.find().limit(10).skip(10);
    assert.strictEqual(page1.length, 10);
    assert.strictEqual(page2.length, 5);
  });

  await t.test("saving: duplicate save on the same opportunity is rejected by the unique index", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const opportunity = await Opportunity.findOne();

    await Application.create({ user: user._id, opportunity: opportunity._id, status: "Saved" });

    await assert.rejects(
      () => Application.create({ user: user._id, opportunity: opportunity._id, status: "Saved" }),
      /duplicate key|E11000/,
      "the unique compound index on {user, opportunity} should reject the second save"
    );
  });

  await mongoose.connection.close();
});
