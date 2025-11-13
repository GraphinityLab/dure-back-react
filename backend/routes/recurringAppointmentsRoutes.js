import express from 'express';
import {
  getRecurringAppointments,
  createRecurringAppointment,
  updateRecurringAppointment,
  deleteRecurringAppointment,
  generateAppointmentsFromRecurring,
} from '../controllers/recurringAppointmentsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getRecurringAppointments);
router.post('/', createRecurringAppointment);
router.put('/:recurring_id', updateRecurringAppointment);
router.delete('/:recurring_id', deleteRecurringAppointment);
router.post('/:recurring_id/generate', generateAppointmentsFromRecurring);

export default router;

