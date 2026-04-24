import express from 'express';
import { createQuiz, getQuizById, submitQuizAttempt, getQuizResults, updateQuiz } from '../controllers/quizController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, authorize('instructor', 'admin'), createQuiz);

router.route('/:id')
    .get(protect, getQuizById)
    .put(protect, authorize('instructor', 'admin'), updateQuiz);
router.route('/:id/submit').post(protect, submitQuizAttempt);
router.route('/:id/results').get(protect, authorize('instructor', 'admin'), getQuizResults);

export default router;
