"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quizController_1 = require("../controllers/quizController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), quizController_1.createQuiz);
router.route('/:id')
    .get(authMiddleware_1.protect, quizController_1.getQuizById)
    .put(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), quizController_1.updateQuiz);
router.route('/:id/submit').post(authMiddleware_1.protect, quizController_1.submitQuizAttempt);
router.route('/:id/results').get(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), quizController_1.getQuizResults);
exports.default = router;
