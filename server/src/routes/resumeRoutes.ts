import express from 'express';
import { analyzeResume, getResumeResult, getResumeHistory } from '../controllers/resumeController';
import { protect, authorize } from '../middleware/authMiddleware';
import multer from 'multer';

// Memory storage to stream chunks directly into pdf-parse efficiently without disk I/O bottlenecks
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Cap at 5MB
});

const router = express.Router();

// Middleware lock specifically restricting external or unauthorized requests
router.use(protect);

router.post('/analyze', authorize('student'), upload.single('resume'), analyzeResume);
router.get('/history', authorize('student'), getResumeHistory);
router.get('/result/:id', authorize('student'), getResumeResult);

export default router;
