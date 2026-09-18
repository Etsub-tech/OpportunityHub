const test = require("node:test");
const assert = require("node:assert");
const { checkEligibility } = require("../services/matchingService");

// These test the matching RULES directly - proving the explainable logic
// behaves correctly for a range of profile/opportunity combinations,
// without needing MongoDB at all (checkEligibility is a pure function).

test("matching: full match on every stated field returns 'Potential Match'", () => {
  const user = {
    country: "Ethiopia",
    degree: "Computer Science",
    studyLevel: "Undergraduate",
    expectedGraduationYear: 2027,
    skills: ["JavaScript", "React"],
  };
  const opportunity = {
    eligibleCountries: ["Ethiopia", "Kenya"],
    degreeRequirements: ["Computer Science"],
    studyLevel: ["Undergraduate"],
    minGraduationYear: 2026,
    maxGraduationYear: 2028,
    skills: ["JavaScript"],
    remote: true,
  };

  const result = checkEligibility(user, opportunity);
  assert.strictEqual(result.verdict, "Potential Match");
});

test("matching: a stated requirement the user fails returns 'Not a Match'", () => {
  const user = { country: "Ethiopia", expectedGraduationYear: 2030 };
  const opportunity = {
    eligibleCountries: [],
    degreeRequirements: [],
    studyLevel: [],
    minGraduationYear: 2026,
    maxGraduationYear: 2028, // user graduates too late
    skills: [],
  };

  const result = checkEligibility(user, opportunity);
  assert.strictEqual(result.verdict, "Not a Match");
});

test("matching: an opportunity that states nothing returns 'Check Eligibility Details', never a false match", () => {
  const user = { country: "Ethiopia" };
  const opportunity = {
    eligibleCountries: [],
    degreeRequirements: [],
    studyLevel: [],
    skills: [],
  };

  const result = checkEligibility(user, opportunity);
  assert.strictEqual(result.verdict, "Check Eligibility Details");
  // Every check should be "unknown" - we never invent a match from silence.
  assert.ok(result.checks.every((c) => c.status === "unknown"));
});

test("matching: country restriction excluding the user's country is a mismatch, not silently ignored", () => {
  const user = { country: "Ethiopia" };
  const opportunity = { eligibleCountries: ["Germany", "France"] };

  const result = checkEligibility(user, opportunity);
  const countryCheck = result.checks[0];
  assert.strictEqual(countryCheck.status, "mismatch");
});

test("matching: partial skill overlap is reported as 'unknown', not a hard mismatch", () => {
  const user = { skills: ["JavaScript"] };
  const opportunity = { skills: ["JavaScript", "Python"] };

  const result = checkEligibility(user, opportunity);
  const skillsCheck = result.checks.find((c) => c.message.includes("skills are missing"));
  assert.strictEqual(skillsCheck.status, "unknown");
});
