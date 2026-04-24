import express from 'express';
import { getCourses, getCourseById, createCourse, addVideoToCourse, getInstructorCourses, addModuleToCourse, deleteVideoFromModule } from '../controllers/courseController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/my-courses').get(protect, authorize('instructor', 'admin'), getInstructorCourses);

import upload from '../middleware/uploadMiddleware';

router.route('/:id').get(getCourseById);
router.route('/:id/modules').post(protect, authorize('instructor', 'admin'), addModuleToCourse);
router.route('/:courseId/modules/:moduleIndex/videos/:videoId').delete(protect, authorize('instructor', 'admin'), deleteVideoFromModule);
router.route('/video').post(protect, authorize('instructor', 'admin'), upload.single('video'), addVideoToCourse);

export default router;
