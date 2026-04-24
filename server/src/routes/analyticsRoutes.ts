import express from 'express';
import { getUserAnalytics, getInstructorAnalytics } from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getUserAnalytics);
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorAnalytics);

export default router;
