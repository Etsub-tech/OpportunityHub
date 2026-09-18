const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");

// POST /api/applications
// Body: { opportunityId, status } - status defaults to "Saved" if omitted.
// This single endpoint handles BOTH "save an opportunity" (status: Saved)
// and "start tracking my application" (any other status) - saving is just
// the first status in the tracker's lifecycle.
async function createApplication(req, res) {
  const { opportunityId, status } = req.body;

  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    return res.status(404).json({ message: "Opportunity not found." });
  }

  // The unique index on {user, opportunity} in the model would also catch
  // this, but checking here first lets us return a clear 400 message
  // instead of a raw MongoDB duplicate-key error.
  const existing = await Application.findOne({ user: req.user._id, opportunity: opportunityId });
  if (existing) {
    return res.status(400).json({ message: "You've already saved or tracked this opportunity." });
  }

  const application = await Application.create({
    user: req.user._id,
    opportunity: opportunityId,
    status: status || "Saved",
  });

  res.status(201).json({ application });
}

// GET /api/applications
// Returns the user's full tracker, grouped by status, plus counts - this is
// exactly what the Application Dashboard (Saved: 12, Applied: 8, ...) needs.
async function getApplications(req, res) {
  const applications = await Application.find({ user: req.user._id })
    .populate("opportunity") // replaces the opportunity ObjectId with the full opportunity document
    .sort({ updatedAt: -1 });

  const counts = {
    Saved: 0,
    Preparing: 0,
    Applied: 0,
    Interview: 0,
    Accepted: 0,
    Rejected: 0,
  };
  for (const app of applications) {
    counts[app.status] = (counts[app.status] || 0) + 1;
  }

  res.json({ applications, counts });
}

// PATCH /api/applications/:id
// Body: { status?, notes? } - a user can update either or both.
async function updateApplication(req, res) {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({ message: "Application not found." });
  }
  // Ownership check: a user must only be able to edit THEIR OWN tracker
  // entries, never someone else's, even if they guess a valid id.
  if (application.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You don't have access to this application." });
  }

  if (req.body.status !== undefined) application.status = req.body.status;
  if (req.body.notes !== undefined) application.notes = req.body.notes;

  await application.save();
  res.json({ application });
}

// DELETE /api/applications/:id
async function deleteApplication(req, res) {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({ message: "Application not found." });
  }
  if (application.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You don't have access to this application." });
  }

  await application.deleteOne();
  res.json({ message: "Removed." });
}

module.exports = { createApplication, getApplications, updateApplication, deleteApplication };
