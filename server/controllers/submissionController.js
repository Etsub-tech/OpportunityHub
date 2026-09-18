const Submission = require("../models/Submission");
const Opportunity = require("../models/Opportunity");

// POST /api/submissions  (any logged-in user)
async function createSubmission(req, res) {
  const { title, organization, opportunityType, applicationUrl, description, country, deadline, notes } = req.body;

  if (!title || !organization || !opportunityType || !applicationUrl || !description) {
    return res.status(400).json({ message: "Title, organization, type, application URL, and description are required." });
  }

  const submission = await Submission.create({
    submittedBy: req.user._id,
    title,
    organization,
    opportunityType,
    applicationUrl,
    description,
    country,
    deadline,
    notes,
  });

  res.status(201).json({ submission });
}

// GET /api/submissions/mine  (the submitter checking their own status)
async function getMySubmissions(req, res) {
  const submissions = await Submission.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ submissions });
}

// GET /api/admin/submissions  (admin only)
async function getAllSubmissions(req, res) {
  const submissions = await Submission.find().populate("submittedBy", "name email").sort({ createdAt: -1 });
  res.json({ submissions });
}

// PATCH /api/admin/submissions/:id  (admin only)
// Body: { action: "approve" | "reject", rejectionReason? }
// Approving a submission is where it graduates from "unverified user input"
// to a real Opportunity that appears on Discover.
async function reviewSubmission(req, res) {
  const { action, rejectionReason } = req.body;
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return res.status(404).json({ message: "Submission not found." });
  }
  if (submission.status !== "pending") {
    return res.status(400).json({ message: "This submission has already been reviewed." });
  }

  if (action === "approve") {
    const opportunity = await Opportunity.create({
      title: submission.title,
      organization: submission.organization,
      description: submission.description,
      opportunityType: submission.opportunityType,
      country: submission.country,
      applicationUrl: submission.applicationUrl,
      deadline: submission.deadline,
      source: "User Submission",
      createdBy: req.user._id,
    });

    submission.status = "approved";
    submission.reviewedBy = req.user._id;
    await submission.save();

    return res.json({ submission, opportunity });
  }

  if (action === "reject") {
    submission.status = "rejected";
    submission.reviewedBy = req.user._id;
    submission.rejectionReason = rejectionReason || "";
    await submission.save();
    return res.json({ submission });
  }

  return res.status(400).json({ message: "action must be 'approve' or 'reject'." });
}

module.exports = { createSubmission, getMySubmissions, getAllSubmissions, reviewSubmission };
