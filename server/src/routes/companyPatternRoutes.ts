import express from 'express';
import {
    createCompanyPattern,
    getCompanyPatterns,
    getCompanyPatternById,
    deleteCompanyPattern,
    cloneCompanyPattern,
    seedGlobalPatterns
} from '../controllers/companyPatternController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/seed', protect, authorize('admin'), seedGlobalPatterns);
router.post('/:id/clone', protect, authorize('instructor', 'admin'), cloneCompanyPattern);


router.route('/')
    .post(protect, authorize('instructor', 'admin'), createCompanyPattern)
    .get(protect, getCompanyPatterns);

router.route('/:id')
    .get(protect, getCompanyPatternById)
    .delete(protect, authorize('instructor', 'admin'), deleteCompanyPattern);

export default router;
