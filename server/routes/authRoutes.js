const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

// Public routes — no token needed
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));

// Protected routes — "protect" runs first and checks the JWT
router.get("/me", protect, asyncHandler(getMe));
router.patch("/profile", protect, asyncHandler(updateProfile));
router.patch("/password", protect, asyncHandler(changePassword));

module.exports = router;
