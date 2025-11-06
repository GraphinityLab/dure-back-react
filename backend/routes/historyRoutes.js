import express from 'express';

import {
  createHistory,
  deleteHistory,
  getAppointmentHistory,
  getHistoryByID,
} from '../controllers/historyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes are protected by authentication
router.use(authMiddleware);

// -------------------- HISTORY ROUTES --------------------

// READ all appointment history (requires history_read_all)
router.get("/", permissionMiddleware("history_read_all"), getAppointmentHistory);

// READ single history entry (requires history_read_single)
router.get("/:history_id", permissionMiddleware("history_read_single"), getHistoryByID);

// CREATE new history record (requires history_create)
router.post("/", permissionMiddleware("history_create"), createHistory);

// DELETE history record (requires history_delete)
router.delete("/:history_id", permissionMiddleware("history_delete"), deleteHistory);

export default router;
