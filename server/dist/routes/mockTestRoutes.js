"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mockTestController_1 = require("../controllers/mockTestController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/generate', authMiddleware_1.protect, mockTestController_1.generateMockTest);
router.post('/submit', authMiddleware_1.protect, mockTestController_1.submitMockTest);
router.get('/history', authMiddleware_1.protect, mockTestController_1.getMockTestHistory);
router.get('/results/:id', authMiddleware_1.protect, mockTestController_1.getMockTestResultById);
exports.default = router;
