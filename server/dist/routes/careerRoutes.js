"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const careerController_1 = require("../controllers/careerController");
const router = express_1.default.Router();
// Public / Student
router.get('/recommendation', authMiddleware_1.protect, careerController_1.getRecommendations);
router.post('/recalculate', authMiddleware_1.protect, careerController_1.recalculateRecommendations);
router.get('/roles', authMiddleware_1.protect, careerController_1.getCareerRoles);
// Admin / Instructor
router.post('/roles', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'instructor'), careerController_1.createCareerRole);
exports.default = router;
