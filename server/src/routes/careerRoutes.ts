import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getRecommendations, recalculateRecommendations, getCareerRoles, createCareerRole } from '../controllers/careerController';

const router = express.Router();

// Public / Student
router.get('/recommendation', protect, getRecommendations);
router.post('/recalculate', protect, recalculateRecommendations);
router.get('/roles', protect, getCareerRoles);

// Admin / Instructor
router.post('/roles', protect, authorize('admin', 'instructor'), createCareerRole);

export default router;
