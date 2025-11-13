import express from 'express';
import {
  clockIn,
  clockOut,
  getCurrentStatus,
  getMyClockLogs,
  getAllClockLogs,
  getClockStatistics,
  exportWorkHours,
} from '../controllers/clockInOutController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Clock in/out routes (all staff)
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/status', getCurrentStatus);
router.get('/my-logs', getMyClockLogs);

// Statistics (all staff can see their own)
router.get('/statistics', getClockStatistics);

// Export work hours (employees can export their own, admins can export any/all)
router.get('/export', exportWorkHours);

// Admin routes (view all logs)
router.get('/logs', permissionMiddleware('staff_read_all'), getAllClockLogs);

export default router;

