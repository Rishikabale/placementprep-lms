import express from 'express';
import { getAdminDashboardStats } from '../controllers/adminDashboardController';
import { getAllUsers, getUserById, toggleUserStatus, deleteUser } from '../controllers/adminUserController';
import { getAllCourses, assignInstructor, deleteCourse } from '../controllers/adminCourseController';
import { getAdminQuestions, bulkUploadQuestions, deleteQuestion } from '../controllers/adminQuestionController';
import { getAdminTestMetrics } from '../controllers/adminTestController';
import { getMasterAnalytics } from '../controllers/adminAnalyticsController';
import { getAdminResumeTrends } from '../controllers/adminResumeController';
import { getSystemSettings, updateSystemSettings } from '../controllers/adminSettingsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// All routes here are strictly Admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);

// User Management Routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Course Management Routes
router.get('/courses', getAllCourses);
router.put('/courses/:courseId/assign', assignInstructor);
router.delete('/courses/:courseId', deleteCourse);

// Question Bank Routes
router.get('/questions', getAdminQuestions);
router.post('/questions/bulk', bulkUploadQuestions);
router.delete('/questions/:id', deleteQuestion);

// Global Testing Metrics
router.get('/tests', getAdminTestMetrics);

// Master Placement Analytics
router.get('/analytics', getMasterAnalytics);

// Resume Analyzer Monitoring
router.get('/resumes', getAdminResumeTrends);

// System Settings Global Configuration
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;
