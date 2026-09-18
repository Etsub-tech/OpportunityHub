const Opportunity = require("../models/Opportunity");
const User = require("../models/User");
const Submission = require("../models/Submission");
const { runIngestion } = require("../services/ingestionService");

// POST /api/admin/opportunities
async function createOpportunity(req, res) {
  const opportunity = await Opportunity.create({ ...req.body, source: req.body.source || "Admin", createdBy: req.user._id });
  res.status(201).json({ opportunity });
}

// PATCH /api/admin/opportunities/:id
async function updateOpportunity(req, res) {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) return res.status(404).json({ message: "Opportunity not found." });

  Object.assign(opportunity, req.body, { lastUpdated: new Date() });
  await opportunity.save();
  res.json({ opportunity });
}

// DELETE /api/admin/opportunities/:id
async function deleteOpportunity(req, res) {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) return res.status(404).json({ message: "Opportunity not found." });

  await opportunity.deleteOne();
  res.json({ message: "Opportunity deleted." });
}

// GET /api/admin/stats
// A handful of simple counts - not a full analytics system, just enough
// for an admin to see the health of the platform at a glance.
async function getStats(req, res) {
  const [totalUsers, totalOpportunities, activeOpportunities, pendingSubmissions, opportunitiesBySource] = await Promise.all([
    User.countDocuments(),
    Opportunity.countDocuments(),
    Opportunity.countDocuments({ $or: [{ deadline: { $gte: new Date() } }, { deadline: null }] }),
    Submission.countDocuments({ status: "pending" }),
    Opportunity.aggregate([{ $group: { _id: "$source", count: { $sum: 1 } } }]),
  ]);

  res.json({ totalUsers, totalOpportunities, activeOpportunities, pendingSubmissions, opportunitiesBySource });
}

// POST /api/admin/ingest/run
// Lets an admin trigger the scheduled ingestion job on demand, instead of
// waiting for the next automatic run - useful for testing and demos.
async function triggerIngestion(req, res) {
  const result = await runIngestion();
  res.json(result);
}

module.exports = { createOpportunity, updateOpportunity, deleteOpportunity, getStats, triggerIngestion };
