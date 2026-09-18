const express = require("express");
const router = express.Router();
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const {
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getStats,
  triggerIngestion,
} = require("../controllers/adminController");
const { getAllSubmissions, reviewSubmission } = require("../controllers/submissionController");

// Both middleware run for EVERY route below: protect confirms there's a
// valid logged-in user, requireAdmin then confirms that user's role is
// "admin". A regular logged-in user gets a 403 here, not a 401 - they ARE
// authenticated, they're just not AUTHORIZED for this resource.
router.use(protect, requireAdmin);

router.post("/opportunities", asyncHandler(createOpportunity));
router.patch("/opportunities/:id", asyncHandler(updateOpportunity));
router.delete("/opportunities/:id", asyncHandler(deleteOpportunity));

router.get("/submissions", asyncHandler(getAllSubmissions));
router.patch("/submissions/:id", asyncHandler(reviewSubmission));

router.get("/stats", asyncHandler(getStats));
router.post("/ingest/run", asyncHandler(triggerIngestion));

module.exports = router;
