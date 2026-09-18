// Express calls this automatically whenever a route handler throws or
// calls next(error), because it has 4 arguments (err, req, res, next).
// Without this, an unhandled error would either crash the server or send
// a raw stack trace to the client — both bad. This is the ONE place
// that decides how errors look to the outside world.
function errorHandler(err, req, res, next) {
  console.error(err.stack); // full detail stays in our server logs only

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || "Something went wrong on the server.",
    // Never send the stack trace to the client — that's an information leak.
  });
}

// Catches requests to URLs that don't match any route (e.g. typo in the path).
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
