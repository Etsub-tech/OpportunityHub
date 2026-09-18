// Express does NOT automatically catch errors thrown inside an `async`
// controller — if a promise rejects (e.g. a bad MongoDB query) and nobody
// catches it, the request just hangs or the process crashes.
// This wraps a controller so any thrown error gets passed to next(error),
// which routes it to our errorHandler middleware.
// This is a genuinely simple 5-line function — that's why we write it
// ourselves instead of installing the "express-async-handler" package.
function asyncHandler(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

module.exports = asyncHandler;
