const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { createSubmission, getMySubmissions } = require("../controllers/submissionController");

router.use(protect);

router.post("/", asyncHandler(createSubmission));
router.get("/mine", asyncHandler(getMySubmissions));

module.exports = router;
