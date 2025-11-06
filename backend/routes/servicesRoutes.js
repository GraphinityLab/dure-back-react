import express from 'express';

import {
  createService,
  deleteService,
  getServiceByID,
  getServices,
  updateService,
} from '../controllers/servicesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// -------------------- SERVICES ROUTES --------------------

// Create service (requires service_create)
router.post("/", authMiddleware, permissionMiddleware("service_create"), createService);

// Update service (requires service_update)
router.put("/:service_id", authMiddleware, permissionMiddleware("service_update"), updateService);

// Delete service (requires service_delete)
router.delete("/:service_id", authMiddleware, permissionMiddleware("service_delete"), deleteService);

// Get all services (requires service_read_all)
router.get("/", authMiddleware, permissionMiddleware("service_read_all"), getServices);

// Get service by ID (requires service_read_single)
router.get("/:service_id", authMiddleware, permissionMiddleware("service_read_single"), getServiceByID);

export default router;
