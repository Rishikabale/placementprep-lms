import { Request, Response } from 'express';
import Progress from '../models/Progress';
import { generateRecommendations } from '../services/recommendationEngine';
import User from '../models/User';
import Course from '../models/Course';
import AIMockTest from '../models/AIMockTest';
import CareerRecommendation from '../models/CareerRecommendation';
import StudentPerformanceProfile from '../models/StudentPerformanceProfile';

export const getUserAnalytics = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user._id;

        // Trigger Recommendation Engine Calculation
        const recommendation = await generateRecommendations(studentId);

        // 1. Fetch Core Progress (Courses)
        const progress = await Progress.findOne({ student: studentId })
            .populate('completedVideos')
            .populate('quizScores.quizId');

        // 2. Fetch Performance Profile (Adaptive Index)
        const profile = await StudentPerformanceProfile.findOne({ student: studentId });

        // 3. Fetch Recent AI Mock Tests
        const recentTests = await AIMockTest.find({ student: studentId, completedAt: { $ne: null } })
            .sort({ completedAt: -1 })
            .limit(5);

        // 4. Fetch Career Recommendation
        const career = await CareerRecommendation.findOne({ student: studentId }).sort({ generatedAt: -1 });

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
            const avgRecent = recentTests.reduce((acc: number, t: any) => acc + (t.totalScore / t.maxScore * 100), 0) / recentTests.length;
            readinessScore = (readinessScore + avgRecent) / 2;
        }

        res.json({
            progress,
            performance: profile,
            recentTests,
            career,
            readinessScore: Math.round(readinessScore)
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getInstructorAnalytics = async (req: Request, res: Response) => {
    try {
        console.log("[getInstructorAnalytics] Starting analysis...");

        // 1. System Summary
        // Note: Role is capitalized 'Student' in User model
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalCourses = await Course.countDocuments({});
        const totalTestsTaken = await AIMockTest.countDocuments({ completedAt: { $ne: null } });

        console.log(`[getInstructorAnalytics] Counts: Students=${totalStudents}, Courses=${totalCourses}, Tests=${totalTestsTaken}`);

        // 2. Performance Overview (Avg Scores)
        const tests = await AIMockTest.find({ completedAt: { $ne: null } }).select('totalScore maxScore');
        let avgScore = 0;
        if (tests.length > 0) {
            const sumPercent = tests.reduce((acc: number, t: any) => {
                const max = t.maxScore || 1; // Prevent div by zero
                return acc + (t.totalScore / max * 100);
            }, 0);
            avgScore = Math.round(sumPercent / tests.length);
        }

        // 3. Top Failing Topics (Aggregation)
        console.log("[getInstructorAnalytics] Aggregating weak topics...");
        const topicPerformance = await AIMockTest.aggregate([
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

    } catch (error) {
        console.error("Instructor Analytics Error:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
