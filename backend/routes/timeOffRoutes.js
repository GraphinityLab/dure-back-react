import express from 'express';
import {
  getLeaveTypes,
  createLeaveType,
  getTimeOffRequests,
  createTimeOffRequest,
  updateTimeOffRequestStatus,
  getLeaveBalances,
  updateLeaveBalance,
} from '../controllers/timeOffController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Leave types (admin only for create)
router.get('/leave-types', getLeaveTypes);
router.post('/leave-types', permissionMiddleware('staff_update'), createLeaveType);

// Time-off requests
router.get('/requests', getTimeOffRequests);
router.post('/requests', createTimeOffRequest);
router.put('/requests/:request_id/status', permissionMiddleware('staff_update'), updateTimeOffRequestStatus);

// Leave balances
router.get('/staff/:staff_id/balances', getLeaveBalances);
router.put('/staff/:staff_id/balances', permissionMiddleware('staff_update'), updateLeaveBalance);

export default router;

