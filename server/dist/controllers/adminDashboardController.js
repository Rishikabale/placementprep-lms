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
exports.getAdminDashboardStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const Course_1 = __importDefault(require("../models/Course"));
const CompanyTestAttempt_1 = __importDefault(require("../models/CompanyTestAttempt"));
const ResumeAnalysis_1 = __importDefault(require("../models/ResumeAnalysis"));
// @desc    Get Admin Dashboard Overview Stats & Activity
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. System Overview Cards
        const totalStudents = yield User_1.default.countDocuments({ role: 'student' });
        const totalInstructors = yield User_1.default.countDocuments({ role: 'instructor' });
        const totalCourses = yield Course_1.default.countDocuments();
        // Count total company test attempts
        const totalTestsTaken = yield CompanyTestAttempt_1.default.countDocuments();
        // Calculate Average Placement Readiness (using Resume Score as a proxy, could be expanded)
        let avgPlacementReadiness = 0;
        const avgResumeResult = yield ResumeAnalysis_1.default.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
        ]);
        if (avgResumeResult.length > 0) {
            avgPlacementReadiness = Math.round(avgResumeResult[0].avgScore);
        }
        // 2. Activity Overview
        const recentUsers = yield User_1.default.find({ role: 'student' })
            .select('-password').sort({ createdAt: -1 }).limit(5);
        const recentTestAttempts = yield CompanyTestAttempt_1.default.find()
            .populate('studentId', 'name email').sort({ createdAt: -1 }).limit(5);
        const recentResumes = yield ResumeAnalysis_1.default.find()
            .populate('studentId', 'name email').sort({ createdAt: -1 }).limit(5);
        // 3. Performance Snapshot
        // We can aggregate section scores (Quant vs Coding) but schema currently stores weakestSection text.
        // Let's get generic averages overall Tests
        const avgScores = yield CompanyTestAttempt_1.default.aggregate([
            { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' }, avgTotalScore: { $avg: '$score' } } }
        ]);
        const avgAptitudeAccuracy = avgScores.length > 0 ? Math.round(avgScores[0].avgAccuracy) : 0;
        // 4. Alerts Panel
        const atRiskStudentsResult = yield ResumeAnalysis_1.default.aggregate([
            { $match: { totalScore: { $lt: 40 } } },
            { $sort: { totalScore: 1 } },
            { $limit: 10 }
        ]);
        // Populate standard Mongoose way for aggregated results manually or return raw
        const atRiskStudents = yield ResumeAnalysis_1.default.populate(atRiskStudentsResult, { path: 'studentId', select: 'name email' });
        res.json({
            overview: {
                totalStudents,
                totalInstructors,
                totalCourses,
                totalTestsTaken,
                avgPlacementReadiness
            },
            activity: {
                recentUsers,
                recentTestAttempts,
                recentResumes
            },
            performance: {
                avgAptitudeAccuracy
            },
            alerts: {
                atRiskStudents
            }
        });
    }
    catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).json({ message: 'Server error loading admin dashboard stats' });
    }
});
exports.getAdminDashboardStats = getAdminDashboardStats;
