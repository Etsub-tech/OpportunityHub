const jwt = require("jsonwebtoken");

// A JWT (JSON Web Token) is a signed piece of text the server hands the
// browser after login. The browser sends it back on every future request
// (in the Authorization header) instead of re-sending the password.
// Because it's signed with JWT_SECRET, the server can trust it without
// needing to look anything up in the database on every request.
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
}

module.exports = generateToken;
