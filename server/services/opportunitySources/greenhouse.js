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

// Job descriptions from Greenhouse come as HTML. We strip tags for a plain
// description; the original formatted version is always still available
// via applicationUrl on the source's own site.
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

module.exports = { fetchGreenhouseOpportunities };
