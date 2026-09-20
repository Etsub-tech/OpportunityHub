// A GROUP is a broader bucket of several related, more specific field
// labels (the exact ones opportunitySources/greenhouse.js's guessField()
// writes to the database). Filtering by a group means "match ANY of these",
// which is how a student actually thinks about it ("show me anything
// tech-related") rather than how finely the data happens to be split
// internally.
//
// IMPORTANT: the group NAMES here must match the dropdown options in
// client/src/pages/Discover.jsx. There's no shared package between the
// separate frontend/backend projects, so this is duplicated by hand on
// purpose - adding build tooling just to share one small array would be
// more complexity than the problem needs.
const FIELD_GROUPS = {
  "Technology & Product": ["Software Engineering", "Data & AI", "Security", "Product & Design", "Backend", "Frontend", "AI/ML", "DevOps", "Backend Engineer"],
  "Business & Operations": ["Sales", "Marketing", "Finance & Accounting", "Customer Success", "Legal & Compliance", "People & Recruiting"],
  "Other": ["Other"],
};

module.exports = { FIELD_GROUPS };