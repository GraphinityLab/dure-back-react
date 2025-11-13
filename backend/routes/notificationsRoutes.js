import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notificationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getNotifications);
router.put('/:notification_id/read', markNotificationAsRead);
router.put('/read-all', markAllAsRead);
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateNotificationPreferences);

export default router;

