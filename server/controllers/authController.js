const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "An account with this email already exists." });
  }

  // bcrypt.hash "salts" the password before hashing so two users with the
  // same password don't end up with the same hash in the database.
  // 10 is the "salt rounds" — how much CPU work the hashing does.
  // Higher = slower to crack, but slower to compute. 10 is the standard default.
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    country: req.body.country,
    university: req.body.university,
    degree: req.body.degree,
    fieldOfStudy: req.body.fieldOfStudy,
    studyLevel: req.body.studyLevel,
    currentYear: req.body.currentYear,
    expectedGraduationYear: req.body.expectedGraduationYear,
    skills: req.body.skills,
  });

  res.status(201).json({
    user: toSafeUser(user),
    token: generateToken(user._id),
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email });

  // Deliberately vague message on purpose: telling the client whether the
  // EMAIL or the PASSWORD was wrong helps an attacker enumerate valid emails.
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({
    user: toSafeUser(user),
    token: generateToken(user._id),
  });
}

// GET /api/auth/me  (protected — req.user is set by the auth middleware)
async function getMe(req, res) {
  res.json({ user: toSafeUser(req.user) });
}

// PATCH /api/auth/profile  (protected)
async function updateProfile(req, res) {
  const fieldsAllowedToUpdate = [
    "name",
    "country",
    "university",
    "degree",
    "fieldOfStudy",
    "studyLevel",
    "currentYear",
    "expectedGraduationYear",
    "skills",
    "preferredOpportunityTypes",
    "preferredCountries",
    "remotePreference",
  ];

  // We only copy over fields that are both allowed AND present in the request.
  // This stops someone from sneaking `role: "admin"` into the request body.
  for (const field of fieldsAllowedToUpdate) {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  }

  await req.user.save();
  res.json({ user: toSafeUser(req.user) });
}

// PATCH /api/auth/password  (protected)
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required." });
  }

  // req.user came from the "-password" select in the middleware, so it
  // doesn't have the password field loaded. We re-fetch it here with the
  // password included, just for this check.
  const user = await User.findById(req.user._id);
  const passwordMatches = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password updated successfully." });
}

// Strips the password hash (and anything else sensitive) before sending
// a user object back to the client. Centralized here so we never forget.
function toSafeUser(user) {
  const { _id, name, email, role, country, university, degree, fieldOfStudy,
    studyLevel, currentYear, expectedGraduationYear, skills,
    preferredOpportunityTypes, preferredCountries, remotePreference } = user;

  return { _id, name, email, role, country, university, degree, fieldOfStudy,
    studyLevel, currentYear, expectedGraduationYear, skills,
    preferredOpportunityTypes, preferredCountries, remotePreference };
}

module.exports = { register, login, getMe, updateProfile, changePassword };
