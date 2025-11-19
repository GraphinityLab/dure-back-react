import express from 'express';
import {
  getStaffSchedule,
  getAllStaffSchedules,
  upsertStaffSchedule,
  deleteStaffSchedule,
  getAvailabilityOverrides,
  createAvailabilityOverride,
  deleteAvailabilityOverride,
  getAvailableTimeSlots,
} from '../controllers/staffSchedulesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get available time slots (public for scheduling)
router.get('/:staff_id/available-slots', getAvailableTimeSlots);

// Staff schedule routes
router.get('/:staff_id/schedule', getStaffSchedule);
router.put('/:staff_id/schedule/:day_of_week', upsertStaffSchedule);
router.delete('/:staff_id/schedule/:day_of_week', deleteStaffSchedule);

// Availability overrides
router.get('/:staff_id/overrides', getAvailabilityOverrides);
router.post('/:staff_id/overrides', createAvailabilityOverride);
router.delete('/overrides/:override_id', deleteAvailabilityOverride);

// Admin routes
router.get('/schedules/all', permissionMiddleware('staff_read_all'), getAllStaffSchedules);

export default router;

