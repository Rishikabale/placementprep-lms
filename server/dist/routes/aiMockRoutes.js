"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const aiMockController_1 = require("../controllers/aiMockController");
const router = express_1.default.Router();
router.post('/generate', authMiddleware_1.protect, aiMockController_1.generateTest);
router.post('/submit', authMiddleware_1.protect, aiMockController_1.submitTest);
router.get('/history', authMiddleware_1.protect, aiMockController_1.getStudentHistory); // specific path before param
router.get('/result/:id', authMiddleware_1.protect, aiMockController_1.getTestResult);
exports.default = router;
