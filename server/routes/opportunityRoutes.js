const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const {
  getOpportunities,
  getOpportunityById,
  getMatch,
} = require("../controllers/opportunityController");

router.get("/", asyncHandler(getOpportunities));
router.get("/:id", asyncHandler(getOpportunityById));
router.get("/:id/match", protect, asyncHandler(getMatch));

module.exports = router;
