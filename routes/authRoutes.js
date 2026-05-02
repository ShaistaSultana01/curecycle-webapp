import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// 🛡 Rate-limited public routes (5 attempts / 15 min / IP)
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

// Private Route
router.get("/profile", protect, getProfile);

export default router;
