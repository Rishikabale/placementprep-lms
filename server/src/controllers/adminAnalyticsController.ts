import { Request, Response } from 'express';
import CompanyTestAttempt from '../models/CompanyTestAttempt';
import ResumeAnalysis from '../models/ResumeAnalysis';
import User from '../models/User';

// @desc    Generate Master Analytics Overview
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getMasterAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        // Top 10 Students by Avg Mock Score
        const topStudentsResult = await CompanyTestAttempt.aggregate([
            { $group: { _id: '$studentId', avgScore: { $avg: '$score' }, avgAccuracy: { $avg: '$accuracy' }, testsTaken: { $sum: 1 } } },
            { $match: { testsTaken: { $gte: 2 } } }, // Filter to users who took at least a couple tests
            { $sort: { avgScore: -1 } },
            { $limit: 10 }
        ]);
        const topStudents = await User.populate(topStudentsResult, { path: '_id', select: 'name email' });

        // Most Failed Topics (aggregated weakestSections)
        const weakestSections = await CompanyTestAttempt.aggregate([
            { $group: { _id: '$weakestSection', count: { $sum: 1 } } },
            { $match: { _id: { $ne: 'N/A' } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Resume Score Distribution (To power histogram)
        const resumeScoreDist = await ResumeAnalysis.aggregate([
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

    } catch (error) {
        console.error('Master Analytics Error:', error);
        res.status(500).json({ message: 'Server error generating master analytics' });
    }
};
