"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminTestMetrics = void 0;
const CompanyTestAttempt_1 = __importDefault(require("../models/CompanyTestAttempt"));
// @desc    Get Global Test Trends & History
// @route   GET /api/admin/tests
// @access  Private/Admin
const getAdminTestMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 100 } = req.query;
        // Recently taken company tests
        const recentTests = yield CompanyTestAttempt_1.default.find()
            .populate('studentId', 'name email')
            .populate('companyPatternId', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit));
        // Company Test Volume Grouped by Company Pattern
        const popularTests = yield CompanyTestAttempt_1.default.aggregate([
            { $group: { _id: '$companyName', totalAttempts: { $sum: 1 }, avgScore: { $avg: '$score' }, avgAccuracy: { $avg: '$accuracy' } } },
            { $sort: { totalAttempts: -1 } }
        ]);
        res.json({ recentTests, popularTests });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error retrieving admin test metrics' });
    }
});
exports.getAdminTestMetrics = getAdminTestMetrics;
