// Run with: node seed/demoOpportunities.js
// Inserts a handful of realistic-looking but CLEARLY LABELED demo
// opportunities (isDemo: true) so the frontend has something to display
// before real ingestion has run. Safe to run multiple times - it clears
// only demo data first, never touches real ingested/admin opportunities.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Opportunity = require("../models/Opportunity");

const demoOpportunities = [
  {
    title: "Software Engineering Intern",
    organization: "Demo Tech Co",
    description:
      "A 12-week summer internship on a product engineering team. This is DEMO DATA for development, not a real opportunity.",
    opportunityType: "Internship",
    field: "Computer Science",
    location: "Remote",
    country: "Global",
    remote: true,
    eligibility: "Open to undergraduate students worldwide, including international students.",
    eligibleCountries: [], // empty = not restricted, matches heuristic in matchingService
    degreeRequirements: ["Computer Science", "Software Engineering"],
    studyLevel: ["Undergraduate"],
    minGraduationYear: 2026,
    maxGraduationYear: 2028,
    skills: ["JavaScript", "React", "Node.js"],
    funding: "Paid",
    fundingDetails: "$25/hr, remote stipend included.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20), // 20 days from now
    duration: "12 weeks",
    applicationUrl: "https://example.com/demo-internship",
    source: "Demo",
    isDemo: true,
  },
  {
    title: "Global Undergraduate Scholarship",
    organization: "Demo Foundation",
    description:
      "Fully funded scholarship for undergraduate study abroad. This is DEMO DATA for development, not a real opportunity.",
    opportunityType: "Scholarship",
    field: "Any",
    location: "Germany",
    country: "Germany",
    remote: false,
    eligibility: "Open to students from Sub-Saharan Africa entering an undergraduate program.",
    eligibleCountries: ["Ethiopia", "Kenya", "Nigeria", "Ghana", "Rwanda"],
    degreeRequirements: [],
    studyLevel: ["Undergraduate"],
    minGraduationYear: null,
    maxGraduationYear: null,
    skills: [],
    funding: "Fully Funded",
    fundingDetails: "Tuition, housing, and monthly stipend covered.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    duration: "4 years",
    applicationUrl: "https://example.com/demo-scholarship",
    source: "Demo",
    isDemo: true,
  },
  {
    title: "AI Research Fellowship",
    organization: "Demo Research Institute",
    description:
      "A 6-month remote research fellowship in applied machine learning. This is DEMO DATA for development, not a real opportunity.",
    opportunityType: "Fellowship",
    field: "Artificial Intelligence",
    location: "Remote",
    country: "Global",
    remote: true,
    eligibility: "Open to graduate students and final-year undergraduates with ML coursework.",
    eligibleCountries: [],
    degreeRequirements: ["Computer Science", "Artificial Intelligence", "Software Engineering"],
    studyLevel: ["Undergraduate", "Graduate"],
    minGraduationYear: 2026,
    maxGraduationYear: 2029,
    skills: ["Python", "Machine Learning"],
    funding: "Partially Funded",
    fundingDetails: "$1,500/month stipend.",
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // already expired, to test that state
    duration: "6 months",
    applicationUrl: "https://example.com/demo-fellowship",
    source: "Demo",
    isDemo: true,
  },
  {
    title: "Pan-African Hackathon 2026",
    organization: "Demo Hack Network",
    description:
      "A weekend hackathon open to student teams across Africa, with a remote track for anyone else. This is DEMO DATA for development, not a real opportunity.",
    opportunityType: "Hackathon",
    field: "Any",
    location: "Nairobi, Kenya (+ remote track)",
    country: "Kenya",
    remote: true,
    eligibility: "Open to current university students. No degree or field restriction.",
    eligibleCountries: [],
    degreeRequirements: [],
    studyLevel: ["Undergraduate", "Graduate"],
    skills: [],
    funding: "Unfunded",
    fundingDetails: "Travel grants available for shortlisted in-person teams.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // closing soon, to test urgency sorting
    duration: "2 days",
    applicationUrl: "https://example.com/demo-hackathon",
    source: "Demo",
    isDemo: true,
  },
];

async function seed() {
  await connectDB();
  await Opportunity.deleteMany({ isDemo: true }); // only ever clears demo data, never real data
  await Opportunity.insertMany(demoOpportunities);
  console.log(`Inserted ${demoOpportunities.length} demo opportunities.`);
  await mongoose.disconnect();
}

seed();
