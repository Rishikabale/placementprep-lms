"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionController_1 = require("../controllers/questionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = express_1.default.Router();
router.route('/bulk-upload')
    .post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), uploadMiddleware_1.uploadCsv.single('file'), questionController_1.bulkUploadQuestions);
router.route('/')
    .get(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), questionController_1.getQuestions)
    .post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), questionController_1.createQuestion);
router.route('/:id')
    .put(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), questionController_1.updateQuestion)
    .delete(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), questionController_1.deleteQuestion);
exports.default = router;
