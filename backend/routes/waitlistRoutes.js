import express from 'express';
import {
  getWaitlist,
  addToWaitlist,
  convertWaitlistToAppointment,
  notifyWaitlist,
  removeFromWaitlist,
} from '../controllers/waitlistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getWaitlist);
router.post('/', addToWaitlist);
router.post('/:waitlist_id/convert', convertWaitlistToAppointment);
router.post('/notify', notifyWaitlist);
router.delete('/:waitlist_id', removeFromWaitlist);

export default router;

