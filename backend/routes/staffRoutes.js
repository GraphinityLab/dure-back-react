import express from 'express';

import {
  createStaff,
  deleteStaff,
  getStaff,
  getStaffByID,
  getStaffDashboard,
  updateStaff,
} from '../controllers/staffController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  permissionMiddleware("staff_create"),
  createStaff
);

router.put(
  "/update/:staff_id",
  authMiddleware,
  permissionMiddleware("staff_update"),
  updateStaff
);

router.delete(
  "/delete/:staff_id",
  authMiddleware,
  permissionMiddleware("staff_delete"),
  deleteStaff
);


// DASHBOARD OVERVIEW (must be before parameterized routes)
router.get("/dashboard/overview", authMiddleware, getStaffDashboard);

// READ endpoints
router.get("/", authMiddleware, permissionMiddleware("staff_read_all"), getStaff);
router.get("/:staff_id", authMiddleware, permissionMiddleware("staff_read_single"), getStaffByID);

export default router;
