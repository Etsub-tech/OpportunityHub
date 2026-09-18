const mongoose = require("mongoose");

// One document = one user's relationship to one opportunity.
// "Saving" an opportunity is just creating one of these with status "Saved" -
// we don't need a separate SavedOpportunity collection for that (see README
// for the reasoning: one relationship should have one source of truth).
const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    opportunity: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", required: true },
    status: {
      type: String,
      enum: ["Saved", "Preparing", "Applied", "Interview", "Accepted", "Rejected"],
      default: "Saved",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// A user should never have two Application documents for the same
// opportunity - this unique compound index enforces that at the database
// level (belt-and-suspenders alongside the check we also do in the controller).
applicationSchema.index({ user: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
