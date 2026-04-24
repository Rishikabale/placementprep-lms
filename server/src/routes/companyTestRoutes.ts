import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    startCompanyTest,
    submitCompanyTest,
    getCompanyTestResult,
    getCompanyTestHistory
} from '../controllers/companyTestController';

const router = express.Router();

router.route('/history').get(protect, getCompanyTestHistory);
router.route('/:patternId/start').get(protect, startCompanyTest);
router.route('/submit').post(protect, submitCompanyTest);
router.route('/result/:id').get(protect, getCompanyTestResult);

export default router;
