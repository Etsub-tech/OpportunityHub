// checkEligibility(user, opportunity)
//
// WHAT: compares a user's profile against one opportunity's requirements
//       and returns a list of explainable checks - never a meaningless
//       AI-generated percentage.
//
// WHY:  the whole point of OpportunityHub is "find opportunities you can
//       actually apply for" - a student needs to know WHY something is or
//       isn't a fit, not just a score.
//
// HOW:  it's a plain function with a series of independent if-checks.
//       Each check pushes one result into an array:
//         { status: "match" | "mismatch" | "unknown", message: "..." }
//       "unknown" is used whenever the OPPORTUNITY doesn't state a
//       requirement - we never guess or assume eligibility that isn't
//       actually stated by the source.
//
// COMPLEXITY: every check just compares a few fields - no loops over large
//       collections. For a single (user, opportunity) pair this is O(1)
//       aside from the skills comparison, which is O(number of skills),
//       and skill lists are always small (a handful of items), so in
//       practice this whole function is effectively constant-time.
function checkEligibility(user, opportunity) {
  const checks = [];

  // --- Country eligibility ---
  if (!opportunity.eligibleCountries || opportunity.eligibleCountries.length === 0) {
    checks.push({
      status: "unknown",
      message: "This opportunity doesn't state country restrictions - check the source for visa/eligibility details.",
    });
  } else if (user.country && opportunity.eligibleCountries.includes(user.country)) {
    checks.push({ status: "match", message: `Open to applicants from ${user.country}.` });
  } else {
    checks.push({
      status: "mismatch",
      message: `This opportunity lists specific eligible countries that don't appear to include ${user.country || "your country"}.`,
    });
  }

  // --- Degree / field requirements ---
  if (!opportunity.degreeRequirements || opportunity.degreeRequirements.length === 0) {
    checks.push({ status: "unknown", message: "No specific degree requirement stated." });
  } else if (user.degree && opportunity.degreeRequirements.includes(user.degree)) {
    checks.push({ status: "match", message: `Degree requirement matches: ${user.degree}.` });
  } else {
    checks.push({
      status: "mismatch",
      message: `Requires a degree in: ${opportunity.degreeRequirements.join(", ")}.`,
    });
  }

  // --- Study level (Undergraduate / Graduate / PhD) ---
  if (!opportunity.studyLevel || opportunity.studyLevel.length === 0 || opportunity.studyLevel.includes("Any")) {
    checks.push({ status: "unknown", message: "No specific study level requirement stated." });
  } else if (user.studyLevel && opportunity.studyLevel.includes(user.studyLevel)) {
    checks.push({ status: "match", message: `Study level matches: ${user.studyLevel}.` });
  } else {
    checks.push({
      status: "mismatch",
      message: `Requires study level: ${opportunity.studyLevel.join(", ")}.`,
    });
  }

  // --- Graduation year window ---
  if (!opportunity.minGraduationYear && !opportunity.maxGraduationYear) {
    checks.push({ status: "unknown", message: "No graduation year requirement stated." });
  } else if (user.expectedGraduationYear) {
    const tooEarly = opportunity.minGraduationYear && user.expectedGraduationYear < opportunity.minGraduationYear;
    const tooLate = opportunity.maxGraduationYear && user.expectedGraduationYear > opportunity.maxGraduationYear;

    if (tooEarly || tooLate) {
      checks.push({
        status: "mismatch",
        message: `Requires graduation between ${opportunity.minGraduationYear || "any year"} and ${opportunity.maxGraduationYear || "any year"}; you expect to graduate in ${user.expectedGraduationYear}.`,
      });
    } else {
      checks.push({ status: "match", message: "Graduation year fits the required window." });
    }
  } else {
    checks.push({ status: "unknown", message: "Add your expected graduation year to your profile to check this." });
  }

  // --- Skills overlap ---
  if (!opportunity.skills || opportunity.skills.length === 0) {
    checks.push({ status: "unknown", message: "No specific skills listed for this opportunity." });
  } else {
    const userSkills = user.skills || [];
    const missingSkills = opportunity.skills.filter((skill) => !userSkills.includes(skill));

    if (missingSkills.length === 0) {
      checks.push({ status: "match", message: "You have all the listed skills." });
    } else if (missingSkills.length < opportunity.skills.length) {
      checks.push({
        status: "unknown",
        message: `Some required skills are missing: ${missingSkills.join(", ")}.`,
      });
    } else {
      checks.push({
        status: "mismatch",
        message: `Required skills not found on your profile: ${missingSkills.join(", ")}.`,
      });
    }
  }

  // --- Remote preference (soft check - never blocks a match on its own) ---
  if (user.remotePreference === "Remote only" && opportunity.remote === false) {
    checks.push({ status: "mismatch", message: "You prefer remote-only opportunities; this one is not remote." });
  }

  // --- Overall verdict ---
  // Any hard mismatch => "Not a Match". Otherwise, at least one confirmed
  // match with no mismatches => "Potential Match". All-unknown => "Check Eligibility Details".
  const hasMismatch = checks.some((c) => c.status === "mismatch");
  const hasMatch = checks.some((c) => c.status === "match");

  let verdict;
  if (hasMismatch) {
    verdict = "Not a Match";
  } else if (hasMatch) {
    verdict = "Potential Match";
  } else {
    verdict = "Check Eligibility Details";
  }

  return { verdict, checks };
}

module.exports = { checkEligibility };
