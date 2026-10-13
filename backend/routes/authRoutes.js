import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  getMe,
  resetPassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Rate limiter: 10 attempts per 15 min in production, generous in development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/reset", authLimiter, resetPassword);
router.get("/me", requireAuth, getMe);

export default router;
