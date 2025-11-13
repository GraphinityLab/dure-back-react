import express from 'express';

import {
  createClient,
  deleteClient,
  getAllClients,
  getClientById,
  getClientAppointmentHistory,
  getClientsDashboard,
  updateClient,
} from '../controllers/clientsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes are protected by authMiddleware
router.use(authMiddleware);

// DASHBOARD OVERVIEW (must be before parameterized routes)
router.get("/dashboard/overview", getClientsDashboard);

// GET CLIENT APPOINTMENT HISTORY (must be before parameterized routes)
router.get("/:client_id/history", permissionMiddleware("client_read_single"), getClientAppointmentHistory);

// READ all clients
router.get("/", permissionMiddleware("client_read_all"), getAllClients);

// READ single client
router.get("/:client_id", permissionMiddleware("client_read_single"), getClientById);

// CREATE new client
router.post("/", permissionMiddleware("client_create"), createClient);

// UPDATE client
router.put("/:client_id", permissionMiddleware("client_update"), updateClient);

// DELETE client
router.delete("/:client_id", permissionMiddleware("client_delete"), deleteClient);

export default router;
