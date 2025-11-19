import express from 'express';

import {
  addPermissionToRole,
  createPermission,
  createRole,
  deletePermission,
  deleteRole,
  getPermissions,
  getPermissionsByRole,
  getRoles,
  getRolesDashboard,
  removePermissionFromRole,
} from '../controllers/rolePermissionsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// -------------------- DASHBOARD OVERVIEW (must be before parameterized routes) --------------------
router.get('/dashboard/overview', getRolesDashboard);

// -------------------- ROLES --------------------
// GET all roles with permissions
router.get('/', permissionMiddleware('role_read_all'), getRoles);

// POST create new role
router.post('/', permissionMiddleware('role_create'), createRole);

// DELETE a role
router.delete('/:role_id', permissionMiddleware('role_delete'), deleteRole);

// -------------------- PERMISSIONS --------------------
// GET all permissions
router.get('/permissions', permissionMiddleware('permission_read_all'), getPermissions);

// POST create new permission
router.post('/permissions', permissionMiddleware('permission_create'), createPermission);

// DELETE a permission
router.delete('/permissions/:permission_id', permissionMiddleware('permission_delete'), deletePermission);

// -------------------- ROLE ↔ PERMISSION --------------------
// GET permissions for a specific role
router.get('/:role_id/permissions', permissionMiddleware('role_read_all'), getPermissionsByRole);

// POST add permission to a role
router.post('/:role_id/permissions', permissionMiddleware('role_update'), addPermissionToRole);

// DELETE remove permission from a role
router.delete('/:role_id/permissions/:permission_id', permissionMiddleware('role_update'), removePermissionFromRole);

export default router;
