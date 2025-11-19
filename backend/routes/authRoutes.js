import express from 'express';

import {
  checkSession,
  checkUsernameOrEmail,
  getCurrentUser,
  getCurrentUserStats,
  login,
  logout,
  updateCurrentUser,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// -------------------- AUTH ROUTES --------------------

// Login (email OR username)
router.post("/login", login);

// Logout (clears session)
router.post("/logout", authMiddleware, logout);

// Check current session (no auth required - this is used to check if session exists)
router.get("/check", checkSession);

router.post("/check-username", checkUsernameOrEmail);

// Get current user info
router.get("/me", authMiddleware, getCurrentUser);

// Update current user info
router.put("/me", authMiddleware, updateCurrentUser);

// Get current user statistics
router.get("/me/stats", authMiddleware, getCurrentUserStats);

export default router;
