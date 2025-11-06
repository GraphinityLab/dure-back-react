import express from 'express';

import { getLogs } from '../controllers/logController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes protected by authMiddleware
router.use(authMiddleware);

// -------------------- LOG ROUTES --------------------

// READ all logs
router.get('/', permissionMiddleware('logs_read_all'), getLogs);

export default router;
