import express from 'express';
import {
  getSkills,
  createSkill,
  getStaffSkills,
  assignSkillToStaff,
  removeSkillFromStaff,
  getStaffCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  getExpiringCertifications,
  getStaffTraining,
  createTrainingRecord,
} from '../controllers/skillsCertificationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Skills
router.get('/skills', getSkills);
router.post('/skills', permissionMiddleware('staff_update'), createSkill);

// Staff skills
router.get('/staff/:staff_id/skills', getStaffSkills);
router.post('/staff/:staff_id/skills', permissionMiddleware('staff_update'), assignSkillToStaff);
router.delete('/staff/:staff_id/skills/:skill_id', permissionMiddleware('staff_update'), removeSkillFromStaff);

// Certifications
router.get('/staff/:staff_id/certifications', getStaffCertifications);
router.post('/staff/:staff_id/certifications', createCertification);
router.put('/certifications/:certification_id', updateCertification);
router.delete('/certifications/:certification_id', permissionMiddleware('staff_update'), deleteCertification);
router.get('/certifications/expiring', getExpiringCertifications);

// Training
router.get('/staff/:staff_id/training', getStaffTraining);
router.post('/staff/:staff_id/training', createTrainingRecord);

export default router;

