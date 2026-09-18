const mongoose = require("mongoose");

// One document = one opportunity (internship, scholarship, etc).
// Fields map directly to what the eligibility matcher (services/matchingService.js)
// compares against a User's profile, and what the Discover page filters on.
const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    opportunityType: {
      type: String,
      required: true,
      enum: [
        "Internship",
        "Scholarship",
        "Fellowship",
        "Research",
        "Summer School",
        "Exchange Program",
        "Hackathon",
        "Competition",
        "Remote Job",
        "Graduate Program",
      ],
    },

    field: { type: String, trim: true }, // e.g. "Software Engineering", "Public Health"
    location: { type: String, trim: true }, // free-text display location, e.g. "Berlin, Germany"
    country: { type: String, trim: true }, // normalized country name, used for filtering
    remote: { type: Boolean, default: false },

    // --- Eligibility-related fields, all plain text/arrays so we never
    // pretend to know something the source didn't actually state ---
    eligibility: { type: String }, // free-text eligibility description from the source
    eligibleCountries: [{ type: String, trim: true }], // empty array = not restricted / unknown
    degreeRequirements: [{ type: String, trim: true }], // e.g. ["Computer Science", "Software Engineering"]
    studyLevel: [{
      type: String,
      enum: ["Undergraduate", "Graduate", "PhD", "Any"],
    }],
    minGraduationYear: { type: Number }, // e.g. must graduate in or after this year
    maxGraduationYear: { type: Number },
    skills: [{ type: String, trim: true }],

    funding: {
      type: String,
      enum: ["Fully Funded", "Partially Funded", "Unfunded", "Paid", "Unknown"],
      default: "Unknown",
    },
    fundingDetails: { type: String },

    deadline: { type: Date }, // null means rolling / no fixed deadline
    startDate: { type: Date },
    duration: { type: String, trim: true }, // e.g. "12 weeks"

    applicationUrl: { type: String, required: true }, // where the user actually applies

    // --- Provenance: where did this listing come from? ---
    source: { type: String, required: true, trim: true }, // e.g. "Greenhouse", "Admin", "User Submission", "Demo"
    sourceUrl: { type: String },
    sourceId: { type: String }, // the ID the SOURCE uses for this listing, used for duplicate detection
    isDemo: { type: Boolean, default: false }, // true for seeded/demo data, so it's never confused with real data

    publishedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // set when an admin creates it manually
  },
  { timestamps: true }
);

// --- Indexes ---
// Text index lets $text search cover the two fields users actually search by.
opportunitySchema.index({ title: "text", description: "text" });
// These are the fields users filter by most often on the Discover page —
// indexing them means MongoDB doesn't have to scan every document.
opportunitySchema.index({ opportunityType: 1 });
opportunitySchema.index({ country: 1 });
opportunitySchema.index({ deadline: 1 });
// Used by duplicate detection to quickly check "have we seen this sourceId before?"
opportunitySchema.index({ source: 1, sourceId: 1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);
