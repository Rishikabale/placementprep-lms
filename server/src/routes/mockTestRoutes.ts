import express from 'express';
import {
    generateMockTest,
    submitMockTest,
    getMockTestHistory,
    getMockTestResultById
} from '../controllers/mockTestController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate', protect, generateMockTest);
router.post('/submit', protect, submitMockTest);
router.get('/history', protect, getMockTestHistory);
router.get('/results/:id', protect, getMockTestResultById);

export default router;
