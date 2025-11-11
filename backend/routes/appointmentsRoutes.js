import express from 'express';

import {
  confirmAppointment,
  deleteAppointment,
  getAppointmentByID,
  getAppointments,
  getDashboardOverviewAppointments,
  rescheduleAppointment,
  updateAppointment,
} from '../controllers/appointmentsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes are protected by authentication
router.use(authMiddleware);

// -------------------- DASHBOARD OVERVIEW --------------------
// No permission check required
router.get("/dashboard/overview", getDashboardOverviewAppointments);

// -------------------- APPOINTMENT ROUTES --------------------
router.get("/", permissionMiddleware("appointment_read_all"), getAppointments);
router.get("/:appointment_id", permissionMiddleware("appointment_read_single"), getAppointmentByID);
router.put("/:appointment_id", permissionMiddleware("appointment_update"), updateAppointment);
router.delete("/:appointment_id", permissionMiddleware("appointment_delete"), deleteAppointment);
router.patch("/:appointment_id/confirm", permissionMiddleware("appointment_confirm_deny"), confirmAppointment);
router.patch("/:appointment_id/reschedule", permissionMiddleware("appointment_confirm_deny"), rescheduleAppointment);

export default router;
