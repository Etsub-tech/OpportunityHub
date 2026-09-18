const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

router.use(protect); // every route below requires a logged-in user

router.post("/", asyncHandler(createApplication));
router.get("/", asyncHandler(getApplications));
router.patch("/:id", asyncHandler(updateApplication));
router.delete("/:id", asyncHandler(deleteApplication));

module.exports = router;
