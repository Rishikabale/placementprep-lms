"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminDashboardController_1 = require("../controllers/adminDashboardController");
const adminUserController_1 = require("../controllers/adminUserController");
const adminCourseController_1 = require("../controllers/adminCourseController");
const adminQuestionController_1 = require("../controllers/adminQuestionController");
const adminTestController_1 = require("../controllers/adminTestController");
const adminAnalyticsController_1 = require("../controllers/adminAnalyticsController");
const adminResumeController_1 = require("../controllers/adminResumeController");
const adminSettingsController_1 = require("../controllers/adminSettingsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes here are strictly Admin-only
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorize)('admin'));
router.get('/dashboard', adminDashboardController_1.getAdminDashboardStats);
// User Management Routes
router.get('/users', adminUserController_1.getAllUsers);
router.get('/users/:id', adminUserController_1.getUserById);
router.put('/users/:id/status', adminUserController_1.toggleUserStatus);
router.delete('/users/:id', adminUserController_1.deleteUser);
// Course Management Routes
router.get('/courses', adminCourseController_1.getAllCourses);
router.put('/courses/:courseId/assign', adminCourseController_1.assignInstructor);
router.delete('/courses/:courseId', adminCourseController_1.deleteCourse);
// Question Bank Routes
router.get('/questions', adminQuestionController_1.getAdminQuestions);
router.post('/questions/bulk', adminQuestionController_1.bulkUploadQuestions);
router.delete('/questions/:id', adminQuestionController_1.deleteQuestion);
// Global Testing Metrics
router.get('/tests', adminTestController_1.getAdminTestMetrics);
// Master Placement Analytics
router.get('/analytics', adminAnalyticsController_1.getMasterAnalytics);
// Resume Analyzer Monitoring
router.get('/resumes', adminResumeController_1.getAdminResumeTrends);
// System Settings Global Configuration
router.get('/settings', adminSettingsController_1.getSystemSettings);
router.put('/settings', adminSettingsController_1.updateSystemSettings);
exports.default = router;
