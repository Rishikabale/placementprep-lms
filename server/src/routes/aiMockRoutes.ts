import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { generateTest, submitTest, getTestResult, getStudentHistory } from '../controllers/aiMockController';

const router = express.Router();

router.post('/generate', protect, generateTest);
router.post('/submit', protect, submitTest);
router.get('/history', protect, getStudentHistory); // specific path before param
router.get('/result/:id', protect, getTestResult);

export default router;
