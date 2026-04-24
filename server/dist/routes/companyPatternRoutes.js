"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const companyPatternController_1 = require("../controllers/companyPatternController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/seed', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), companyPatternController_1.seedGlobalPatterns);
router.post('/:id/clone', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), companyPatternController_1.cloneCompanyPattern);
router.route('/')
    .post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), companyPatternController_1.createCompanyPattern)
    .get(authMiddleware_1.protect, companyPatternController_1.getCompanyPatterns);
router.route('/:id')
    .get(authMiddleware_1.protect, companyPatternController_1.getCompanyPatternById)
    .delete(authMiddleware_1.protect, (0, authMiddleware_1.authorize)('instructor', 'admin'), companyPatternController_1.deleteCompanyPattern);
exports.default = router;
