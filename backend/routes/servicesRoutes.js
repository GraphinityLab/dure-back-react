import express from 'express';

import {
  createService,
  deleteService,
  getServiceByID,
  getServiceDashboard,
  getServices,
  updateService,
} from '../controllers/servicesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// -------------------- SERVICES ROUTES --------------------

// Create service (requires service_create)
router.post("/", authMiddleware, createService);

// Update service (requires service_update)
router.put("/:service_id", authMiddleware, updateService);

// Delete service (requires service_delete)
router.delete("/:service_id", authMiddleware, deleteService);

// Get all services (requires service_read_all)
router.get("/", authMiddleware, getServices);

// Get service by ID (requires service_read_single)
router.get("/:service_id", authMiddleware, getServiceByID);

// -------------------- DASHBOARD OVERVIEW ROUTE --------------------
// Get dashboard overview for services (no permission required)
router.get("/dashboard/overview", authMiddleware, getServiceDashboard);

export default router;
