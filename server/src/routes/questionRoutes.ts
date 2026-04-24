import express from 'express';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, bulkUploadQuestions } from '../controllers/questionController';
import { protect, authorize } from '../middleware/authMiddleware';
import { uploadCsv } from '../middleware/uploadMiddleware';

const router = express.Router();

router.route('/bulk-upload')
    .post(protect, authorize('instructor', 'admin'), uploadCsv.single('file'), bulkUploadQuestions);

router.route('/')
    .get(protect, authorize('instructor', 'admin'), getQuestions)
    .post(protect, authorize('instructor', 'admin'), createQuestion);

router.route('/:id')
    .put(protect, authorize('instructor', 'admin'), updateQuestion)
    .delete(protect, authorize('instructor', 'admin'), deleteQuestion);

export default router;
