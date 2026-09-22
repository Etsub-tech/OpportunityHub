// Greenhouse is a real applicant-tracking system used by thousands of
// companies (Stripe, Airbnb, GitLab, and many more) for their careers pages.
// It exposes a genuinely public, unauthenticated JSON API for each
// company's job board:
//
//   GET https://boards-api.greenhouse.io/v1/boards/{boardToken}/jobs?content=true
//
// No API key. No login. This is the SAME endpoint the company's own
// careers page calls in the browser. We picked this as our first real
// source specifically because it needs no credentials to demo.
//
// WHAT fetchGreenhouseOpportunities() returns: an array of objects already
// shaped like our Opportunity model (see models/Opportunity.js), so the
// ingestion service can save them without knowing anything Greenhouse-specific.
//
// LIMITATION we're being upfront about: Greenhouse boards are general job
// postings, not internship/scholarship-specific. We tag postings whose
// title contains "intern" as opportunityType "Internship" and everything
// else as "Remote Job" or leave for admin review - it's a heuristic, not a
// guarantee, and we say so.

const BOARD_TOKENS = (process.env.GREENHOUSE_BOARD_TOKENS || "")
  .split(",")
  .map((token) => token.trim())
  .filter(Boolean);

async function fetchGreenhouseOpportunities() {
  const allJobs = [];

  for (const boardToken of BOARD_TOKENS) {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs?content=true`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Greenhouse fetch failed for board "${boardToken}": HTTP ${response.status}`);
        continue; // one bad board should never stop the others from being ingested
      }

      const data = await response.json();
      const normalized = (data.jobs || []).map((job) => normalizeGreenhouseJob(job, boardToken));
      allJobs.push(...normalized);
    } catch (error) {
      // A network error on one board is logged and skipped, not thrown -
      // see ingestionService.js for why this matters (one source failing
      // must never crash the whole ingestion run).
      console.error(`Greenhouse fetch error for board "${boardToken}":`, error.message);
    }
  }

  return allJobs;
}

function normalizeGreenhouseJob(job, boardToken) {
  const isInternship = /intern/i.test(job.title);

  return {
    title: job.title,
    organization: boardToken, // Greenhouse doesn't return a friendly company name, only the board token
    description: stripHtml(job.content) || "See the official application page for full details.",
    opportunityType: isInternship ? "Internship" : "Remote Job",
    field: guessField(job.title),
    location: job.location?.name || "Not specified",
    country: null, // Greenhouse doesn't reliably give us a normalized country - left for an admin/enrichment step
    remote: /remote/i.test(job.location?.name || ""),
    applicationUrl: job.absolute_url,
    source: "Greenhouse",
    sourceUrl: job.absolute_url,
    sourceId: String(job.id),
    publishedAt: job.updated_at ? new Date(job.updated_at) : new Date(),
  };
}

// WHAT: guesses a department/field from the job TITLE alone.
// WHY:  the basic Greenhouse /jobs endpoint has no department field at all
//       (Greenhouse only exposes that via a separate /departments endpoint,
//       which would mean a second API call per board - more complexity for
//       a guess we can make well enough from the title). Without this, every
//       posting has an empty `field`, and the Field filter on Discover can't
//       tell a software role from a sales role - which is exactly the
//       "everything looks like one undifferentiated pile" problem.
// HOW:  a fixed, readable list of keyword -> field rules, checked in order,
//       first match wins. This is a heuristic, not a guarantee - a title
//       like "Growth Engineer" could arguably fit two buckets - but it's
//       honest about what it is and good enough to make filtering useful.
const FIELD_RULES = [
  // Specific tech buckets are checked FIRST, before the broad Software
  // Engineering catch-all further down - otherwise a title like "AI
  // Engineer" or "Security Engineer" would get claimed by the generic
  // "...engineer..." pattern before ever reaching the rule that actually
  // fits it better.
  { pattern: /data (scientist|engineer|analyst)|machine learning|\bml\b|\bai\b/i, field: "Data & AI" },
  { pattern: /security|privacy/i, field: "Security" },
  { pattern: /product manager|product design|\bux\b|\bui\b/i, field: "Product & Design" },

  // Named tech roles, PLUS a broad "...engineer..." catch-all. Without the
  // catch-all, a plain title like "Engineer II" or "Platform Engineer" -
  // which says nothing about "software" or "developer" specifically - fell
  // through every rule to "Other", even though it's obviously a tech role.
  // This is why titles you could clearly SEE were tech-related still
  // disappeared the moment you filtered to "Technology & Product".
  { pattern: /software|developer|frontend|front-end|backend|back-end|full[\s-]?stack|mobile|ios|android|devops|site reliability|\bsre\b|\bengineer(ing)?\b/i, field: "Software Engineering" },

  { pattern: /account executive|sales|business development|\bsdr\b|\bbdr\b/i, field: "Sales" },
  { pattern: /accounting|finance|treasury|tax|billing/i, field: "Finance & Accounting" },
  { pattern: /recruit|people|hr\b|talent/i, field: "People & Recruiting" },
  { pattern: /marketing|communications|brand/i, field: "Marketing" },
  { pattern: /legal|compliance|counsel/i, field: "Legal & Compliance" },
  { pattern: /customer success|support/i, field: "Customer Success" },
];

function guessField(title) {
  const rule = FIELD_RULES.find((r) => r.pattern.test(title));
  return rule ? rule.field : "Other";
}

// Job descriptions from Greenhouse come as HTML, and some boards return it
// double-escaped (literal "&lt;div&gt;" instead of an actual "<div>" tag).
// We decode the common entities FIRST, then strip whatever real tags are
// left - doing it in the other order would leave "&lt;div&gt;" sitting in
// the text untouched, since there's no literal "<" character for the tag
// regex to find yet.
function stripHtml(html) {
  if (!html) return "";
  const decoded = html
    .replace(/&amp;/g, "&") // must run FIRST: "&nbsp;" was itself escaped to "&amp;nbsp;", so decoding &amp; first turns it back into "&nbsp;" for the next line to catch
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  return decoded.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

module.exports = { fetchGreenhouseOpportunities, guessField };