import express from 'express';

import {
  checkSession,
  checkUsernameOrEmail,
  login,
  logout,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// -------------------- AUTH ROUTES --------------------

// Login (email OR username)
router.post("/login", login);

// Logout (clears session)
router.post("/logout", authMiddleware, logout);

// Check current session
router.get("/check", authMiddleware, checkSession);

router.post("/check-username", checkUsernameOrEmail);
export default router;
