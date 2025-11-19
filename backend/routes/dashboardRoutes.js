import express from 'express';
import { getDashboardOverview } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// -------------------- DASHBOARD OVERVIEW --------------------
router.get('/overview', authMiddleware, getDashboardOverview);

export default router;

