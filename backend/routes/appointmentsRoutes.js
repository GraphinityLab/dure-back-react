import express from 'express';

import {
  confirmAppointment,
  deleteAppointment,
  getAppointmentByID,
  getAppointments,
  rescheduleAppointment,
  updateAppointment,
} from '../controllers/appointmentsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes are protected by authentication
router.use(authMiddleware);

// -------------------- APPOINTMENT ROUTES --------------------

// READ all appointments (requires appointments_read_all)
router.get("/", permissionMiddleware("appointment_read_all"), getAppointments);

// READ single appointment (requires appointments_read_single)
router.get("/:appointment_id", permissionMiddleware("appointment_read_single"), getAppointmentByID);

// UPDATE appointment (requires appointments_update)
router.put("/:appointment_id", permissionMiddleware("appointment_update"), updateAppointment);

// DELETE appointment (requires appointments_delete)
router.delete("/:appointment_id", permissionMiddleware("appointment_delete"), deleteAppointment);

// CONFIRM appointment (requires appointments_confirm)
router.patch("/:appointment_id/confirm", permissionMiddleware("appointment_confirm_deny"), confirmAppointment);

// RESCHEDULE appointment (requires appointments_reschedule)
router.patch("/:appointment_id/reschedule", permissionMiddleware("appointment_confirm_deny"), rescheduleAppointment);

export default router;
