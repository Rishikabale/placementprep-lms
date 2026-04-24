"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(courseController_1.getCourses)
    .post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), courseController_1.createCourse);
router.route('/my-courses').get(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), courseController_1.getInstructorCourses);
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
router.route('/:id').get(courseController_1.getCourseById);
router.route('/:id/modules').post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), courseController_1.addModuleToCourse);
router.route('/:courseId/modules/:moduleIndex/videos/:videoId').delete(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), courseController_1.deleteVideoFromModule);
router.route('/video').post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), uploadMiddleware_1.default.single('video'), courseController_1.addVideoToCourse);
exports.default = router;
