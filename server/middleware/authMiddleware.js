const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Note: this middleware has its own try/catch below, so unlike controllers
// it does NOT need asyncHandler — any error is already caught and turned
// into a clean 401 response instead of reaching the generic error handler.
//
// Runs BEFORE any "protected" controller. Flow:
//   Request → protect middleware → controller
// It reads the token from the Authorization header, verifies it hasn't
// been tampered with, finds the matching user, and attaches it to
// req.user so controllers can use it (e.g. req.user._id).
async function protect(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authenticated. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // .select("-password") means: fetch the user but leave the password hash out
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authenticated. User no longer exists." });
    }

    req.user = user;
    next(); // hand control to the next middleware/controller
  } catch (error) {
    return res.status(401).json({ message: "Not authenticated. Invalid or expired token." });
  }
}

// Runs AFTER protect, on routes only admins should reach.
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

module.exports = { protect, requireAdmin };
