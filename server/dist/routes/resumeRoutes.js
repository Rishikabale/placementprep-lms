"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resumeController_1 = require("../controllers/resumeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
// Memory storage to stream chunks directly into pdf-parse efficiently without disk I/O bottlenecks
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Cap at 5MB
});
const router = express_1.default.Router();
// Middleware lock specifically restricting external or unauthorized requests
router.use(authMiddleware_1.protect);
router.post('/analyze', (0, authMiddleware_1.authorize)('student'), upload.single('resume'), resumeController_1.analyzeResume);
router.get('/history', (0, authMiddleware_1.authorize)('student'), resumeController_1.getResumeHistory);
router.get('/result/:id', (0, authMiddleware_1.authorize)('student'), resumeController_1.getResumeResult);
exports.default = router;
