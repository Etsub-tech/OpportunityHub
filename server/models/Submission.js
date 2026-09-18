const mongoose = require("mongoose");

// A user-submitted opportunity, before an admin has reviewed it.
// We deliberately keep this SEPARATE from the Opportunity model - a
// submission is unverified and shouldn't show up on Discover until an
// admin approves it and we create a real Opportunity from it.
const submissionSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Basic info the submitter provides - a subset of the full Opportunity
    // fields, since we don't want to force a regular user to fill in every
    // field an admin would.
    title: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    opportunityType: { type: String, required: true },
    applicationUrl: { type: String, required: true },
    description: { type: String, required: true },
    country: { type: String, trim: true },
    deadline: { type: Date },
    notes: { type: String }, // submitter's own notes, e.g. "found this on Twitter"

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
