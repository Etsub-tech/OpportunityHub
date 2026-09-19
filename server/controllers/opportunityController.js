const Opportunity = require("../models/Opportunity");
const { checkEligibility } = require("../services/matchingService");

// GET /api/opportunities
// Handles search, every filter, sorting, and pagination all in one query -
// this is what makes it possible to scale to thousands of opportunities
// without ever sending more than one page of results to the browser.
async function getOpportunities(req, res) {
  const {
    search,
    opportunityType,
    country,
    remote,
    field,
    funding,
    studyLevel,
    sort = "deadline",
    page = 1,
    limit = 12,
  } = req.query;

  // We build the MongoDB filter object piece by piece. Any filter the user
  // didn't ask for simply isn't added - so an empty query means "show everything".
  // We build the MongoDB filter object piece by piece. Any filter the user
  // didn't ask for simply isn't added - so an empty query means "show everything".
  const filter = {};
  // Conditions that themselves need an $or go in here instead of directly on
  // `filter`, because `filter.$or = ...` written twice would just overwrite
  // itself (same object key) - $and lets us combine several independent $or
  // clauses safely.
  const andConditions = [];

  if (search) {
    // $text uses the text index we defined on title+description in the model.
    filter.$text = { $search: search };
  }
  if (opportunityType) filter.opportunityType = opportunityType;

  if (country) {
    // Match against EITHER the country field OR the free-text location.
    // Real-world reason: ingested job postings (see opportunitySources/
    // greenhouse.js) almost never have a clean `country` - Greenhouse only
    // gives us a location string like "Remote, Canada" or "Bengaluru". If we
    // only checked `country`, every ingested job would silently fail to
    // match no matter what was typed - it would look like the filter was
    // broken, when really the data just didn't have that field filled in.
    andConditions.push({
      $or: [
        { country: { $regex: country, $options: "i" } },
        { location: { $regex: country, $options: "i" } },
      ],
    });
  }

  if (remote !== undefined) filter.remote = remote === "true";
  // Case-insensitive partial match - the frontend now sends one of the
  // fixed labels from opportunitySources/greenhouse.js's FIELD_RULES (or an
  // admin/demo-entered value), so this reliably matches real stored data
  // instead of free text that may not exist anywhere in the database.
  if (field) filter.field = { $regex: field, $options: "i" };
  if (funding) filter.funding = funding;

  if (studyLevel) {
    // Same "don't punish silence" principle the matching service uses:
    // most REAL ingested job postings never state a study level at all
    // (Greenhouse job titles don't say "Undergraduate" or "Graduate"). A
    // strict `filter.studyLevel = studyLevel` would exclude every one of
    // those - which is wrong, since the posting isn't saying "no
    // undergrads", it's saying nothing. We only exclude an opportunity here
    // if it explicitly lists study levels and this one isn't among them.
    andConditions.push({
      $or: [
        { studyLevel: studyLevel },
        { studyLevel: { $exists: false } },
        { studyLevel: { $size: 0 } },
      ],
    });
  }

  // Never show an opportunity whose deadline has passed on the main Discover
  // list - a user asked to see things they can still apply to. Ingested job
  // postings have no deadline at all (deadline: null), which is why this
  // treats null as "still open" rather than excluding it.
  andConditions.push({ $or: [{ deadline: { $gte: new Date() } }, { deadline: null }] });

  if (andConditions.length > 0) filter.$and = andConditions;

  const sortOptions = {
    deadline: { deadline: 1 }, // closing soon first
    newest: { publishedAt: -1 },
  };

  const pageNumber = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit))); // cap page size so nobody can request 100,000 rows

  // .lean() skips building full Mongoose documents (with all their extra
  // methods) and just returns plain JS objects - faster and uses less
  // memory, and we don't need Mongoose document methods for a read-only list.
  const [opportunities, total] = await Promise.all([
    Opportunity.find(filter)
      .sort(sortOptions[sort] || sortOptions.deadline)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Opportunity.countDocuments(filter),
  ]);

  res.json({
    opportunities,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

// GET /api/opportunities/:id
async function getOpportunityById(req, res) {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) {
    return res.status(404).json({ message: "Opportunity not found." });
  }
  res.json({ opportunity });
}

// GET /api/opportunities/:id/match  (protected - needs a logged-in user's profile)
async function getMatch(req, res) {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) {
    return res.status(404).json({ message: "Opportunity not found." });
  }

  const result = checkEligibility(req.user, opportunity);
  res.json(result);
}

module.exports = { getOpportunities, getOpportunityById, getMatch };
