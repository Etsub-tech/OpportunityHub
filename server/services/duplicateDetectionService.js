const Opportunity = require("../models/Opportunity");

// findDuplicate(candidate)
//
// WHAT: checks whether an opportunity we're about to insert already exists.
//
// WHY:  the same opportunity often appears on multiple sources (e.g. a
//       company posts to both Greenhouse and its own careers page), and a
//       source can also send us an opportunity we already collected last
//       time this job ran. Without this check, Discover would fill up with
//       repeats.
//
// HOW (in priority order, most reliable first):
//   1. Same source + same sourceId  -> definitely the same listing.
//      (Most reliable: the SOURCE itself told us this is a unique ID.)
//   2. Same applicationUrl          -> almost certainly the same listing,
//      since two different opportunities essentially never share an apply link.
//   3. Same normalized title + organization + location -> a heuristic
//      fallback for sources with no stable ID and slightly different URLs
//      (e.g. one has a tracking query string). Less reliable than 1 or 2 -
//      two different opportunities COULD coincidentally share these, but
//      that's rare enough to accept as a tradeoff.
//
// We stop at the first match found - no need to check further once we know.
async function findDuplicate(candidate) {
  if (candidate.source && candidate.sourceId) {
    const bySourceId = await Opportunity.findOne({
      source: candidate.source,
      sourceId: candidate.sourceId,
    });
    if (bySourceId) return bySourceId;
  }

  if (candidate.applicationUrl) {
    const byUrl = await Opportunity.findOne({ applicationUrl: candidate.applicationUrl });
    if (byUrl) return byUrl;
  }

  const normalizedTitle = normalize(candidate.title);
  const normalizedOrg = normalize(candidate.organization);
  const normalizedLocation = normalize(candidate.location);

  // We fetch every opportunity from the same organization (usually a small
  // list) and compare title/location in JS. Doing the fuzzy match with a
  // regex query directly in MongoDB would be slower and harder to read for
  // the small gain of moving the comparison into the database.
  const sameOrgOpportunities = await Opportunity.find({ organization: candidate.organization }).lean();

  const byHeuristic = sameOrgOpportunities.find(
    (existing) =>
      normalize(existing.title) === normalizedTitle &&
      normalize(existing.location) === normalizedLocation
  );
  if (byHeuristic) return byHeuristic;

  return null;
}

function normalize(text) {
  return (text || "").toLowerCase().trim().replace(/\s+/g, " ");
}

module.exports = { findDuplicate };
