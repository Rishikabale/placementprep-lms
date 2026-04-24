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
exports.getMasterAnalytics = void 0;
const CompanyTestAttempt_1 = __importDefault(require("../models/CompanyTestAttempt"));
const ResumeAnalysis_1 = __importDefault(require("../models/ResumeAnalysis"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Generate Master Analytics Overview
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getMasterAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Top 10 Students by Avg Mock Score
        const topStudentsResult = yield CompanyTestAttempt_1.default.aggregate([
            { $group: { _id: '$studentId', avgScore: { $avg: '$score' }, avgAccuracy: { $avg: '$accuracy' }, testsTaken: { $sum: 1 } } },
            { $match: { testsTaken: { $gte: 2 } } }, // Filter to users who took at least a couple tests
            { $sort: { avgScore: -1 } },
            { $limit: 10 }
        ]);
        const topStudents = yield User_1.default.populate(topStudentsResult, { path: '_id', select: 'name email' });
        // Most Failed Topics (aggregated weakestSections)
        const weakestSections = yield CompanyTestAttempt_1.default.aggregate([
            { $group: { _id: '$weakestSection', count: { $sum: 1 } } },
            { $match: { _id: { $ne: 'N/A' } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        // Resume Score Distribution (To power histogram)
        const resumeScoreDist = yield ResumeAnalysis_1.default.aggregate([
            {
                $bucket: {
                    groupBy: "$totalScore",
                    boundaries: [0, 20, 40, 60, 80, 100],
                    default: "Other",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);
        res.json({
            topStudents,
            weakestSections,
            resumeScoreDistribution: resumeScoreDist
        });
    }
    catch (error) {
        console.error('Master Analytics Error:', error);
        res.status(500).json({ message: 'Server error generating master analytics' });
    }
});
exports.getMasterAnalytics = getMasterAnalytics;
