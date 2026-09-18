const mongoose = require("mongoose");

// Every field here exists because either (a) authentication needs it,
// or (b) the eligibility matching engine (Stage 4) will compare it against
// an Opportunity's requirements. We deliberately do NOT collect things like
// phone number, address, or date of birth — the app doesn't need them.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // stored as a bcrypt hash, never plain text
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // --- Profile / eligibility fields ---
    country: { type: String, trim: true },
    university: { type: String, trim: true },
    degree: { type: String, trim: true }, // e.g. "Software Engineering"
    fieldOfStudy: { type: String, trim: true },
    studyLevel: {
      type: String,
      enum: ["Undergraduate", "Graduate", "PhD"],
    },
    currentYear: { type: Number },
    expectedGraduationYear: { type: Number },
    skills: [{ type: String, trim: true }],
    preferredOpportunityTypes: [{ type: String, trim: true }],
    preferredCountries: [{ type: String, trim: true }],
    remotePreference: {
      type: String,
      enum: ["Remote only", "On-site only", "No preference"],
      default: "No preference",
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
