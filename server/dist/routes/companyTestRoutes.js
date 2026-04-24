"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const companyTestController_1 = require("../controllers/companyTestController");
const router = express_1.default.Router();
router.route('/history').get(authMiddleware_1.protect, companyTestController_1.getCompanyTestHistory);
router.route('/:patternId/start').get(authMiddleware_1.protect, companyTestController_1.startCompanyTest);
router.route('/submit').post(authMiddleware_1.protect, companyTestController_1.submitCompanyTest);
router.route('/result/:id').get(authMiddleware_1.protect, companyTestController_1.getCompanyTestResult);
exports.default = router;
