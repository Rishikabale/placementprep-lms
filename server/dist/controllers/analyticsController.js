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
exports.getInstructorAnalytics = exports.getUserAnalytics = void 0;
const Progress_1 = __importDefault(require("../models/Progress"));
const recommendationEngine_1 = require("../services/recommendationEngine");
const User_1 = __importDefault(require("../models/User"));
const Course_1 = __importDefault(require("../models/Course"));
const AIMockTest_1 = __importDefault(require("../models/AIMockTest"));
const CareerRecommendation_1 = __importDefault(require("../models/CareerRecommendation"));
const StudentPerformanceProfile_1 = __importDefault(require("../models/StudentPerformanceProfile"));
const getUserAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = req.user._id;
        // Trigger Recommendation Engine Calculation
        const recommendation = yield (0, recommendationEngine_1.generateRecommendations)(studentId);
        // 1. Fetch Core Progress (Courses)
        const progress = yield Progress_1.default.findOne({ student: studentId })
            .populate('completedVideos')
            .populate('quizScores.quizId');
        // 2. Fetch Performance Profile (Adaptive Index)
        const profile = yield StudentPerformanceProfile_1.default.findOne({ student: studentId });
        // 3. Fetch Recent AI Mock Tests
        const recentTests = yield AIMockTest_1.default.find({ student: studentId, completedAt: { $ne: null } })
            .sort({ completedAt: -1 })
            .limit(5);
        // 4. Fetch Career Recommendation
        const career = yield CareerRecommendation_1.default.findOne({ student: studentId }).sort({ generatedAt: -1 });
        // 5. Calculate Readiness Score (Simple Heuristic for now)
        // Avg of (Adaptive Index Avg + Last 3 Test Scores %)
        let readinessScore = 0;
        if (profile && profile.adaptiveIndex) {
            const idx = profile.adaptiveIndex;
            const avgIndex = (idx.Quant + idx.Logical + idx.Verbal + idx.Coding) / 4;
            readinessScore = avgIndex;
        }
        // Adjust based on recent tests
        if (recentTests.length > 0) {
            const avgRecent = recentTests.reduce((acc, t) => acc + (t.totalScore / t.maxScore * 100), 0) / recentTests.length;
            readinessScore = (readinessScore + avgRecent) / 2;
        }
        res.json({
            progress,
            performance: profile,
            recentTests,
            career,
            readinessScore: Math.round(readinessScore)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.getUserAnalytics = getUserAnalytics;
const getInstructorAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("[getInstructorAnalytics] Starting analysis...");
        // 1. System Summary
        // Note: Role is capitalized 'Student' in User model
        const totalStudents = yield User_1.default.countDocuments({ role: 'student' });
        const totalCourses = yield Course_1.default.countDocuments({});
        const totalTestsTaken = yield AIMockTest_1.default.countDocuments({ completedAt: { $ne: null } });
        console.log(`[getInstructorAnalytics] Counts: Students=${totalStudents}, Courses=${totalCourses}, Tests=${totalTestsTaken}`);
        // 2. Performance Overview (Avg Scores)
        const tests = yield AIMockTest_1.default.find({ completedAt: { $ne: null } }).select('totalScore maxScore');
        let avgScore = 0;
        if (tests.length > 0) {
            const sumPercent = tests.reduce((acc, t) => {
                const max = t.maxScore || 1; // Prevent div by zero
                return acc + (t.totalScore / max * 100);
            }, 0);
            avgScore = Math.round(sumPercent / tests.length);
        }
        // 3. Top Failing Topics (Aggregation)
        console.log("[getInstructorAnalytics] Aggregating weak topics...");
        const topicPerformance = yield AIMockTest_1.default.aggregate([
            { $match: { completedAt: { $ne: null } } },
            { $unwind: "$questions" },
            {
                $group: {
                    _id: "$questions.category",
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { $sum: { $cond: ["$questions.isCorrect", 1, 0] } }
                }
            },
            {
                $project: {
                    category: "$_id",
                    accuracy: {
                        $multiply: [
                            { $divide: ["$correctAttempts", { $cond: ["$totalAttempts", "$totalAttempts", 1] }] },
                            100
                        ]
                    }
                }
            },
            { $sort: { accuracy: 1 } }, // Lowest accuracy first
            { $limit: 5 }
        ]);
        console.log(`[getInstructorAnalytics] Found ${topicPerformance.length} weak topics`);
        res.json({
            summary: {
                totalStudents,
                totalCourses,
                totalTestsTaken,
                avgScore
            },
            weakTopics: topicPerformance || []
        });
    }
    catch (error) {
        console.error("Instructor Analytics Error:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.getInstructorAnalytics = getInstructorAnalytics;
