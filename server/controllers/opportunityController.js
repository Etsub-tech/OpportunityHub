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
  const filter = {};

  if (search) {
    // $text uses the text index we defined on title+description in the model.
    filter.$text = { $search: search };
  }
  if (opportunityType) filter.opportunityType = opportunityType;
  if (country) filter.country = country;
  if (remote !== undefined) filter.remote = remote === "true";
  if (field) filter.field = field;
  if (funding) filter.funding = funding;
  if (studyLevel) filter.studyLevel = studyLevel;

  // Never show an opportunity whose deadline has passed on the main Discover
  // list - a user asked to see things they can still apply to.
  filter.$or = [{ deadline: { $gte: new Date() } }, { deadline: null }];

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
