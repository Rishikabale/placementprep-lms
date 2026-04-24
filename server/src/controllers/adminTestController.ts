import { Request, Response } from 'express';
import CompanyTestAttempt from '../models/CompanyTestAttempt';

// @desc    Get Global Test Trends & History
// @route   GET /api/admin/tests
// @access  Private/Admin
export const getAdminTestMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = 100 } = req.query;

        // Recently taken company tests
        const recentTests = await CompanyTestAttempt.find()
            .populate('studentId', 'name email')
            .populate('companyPatternId', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        // Company Test Volume Grouped by Company Pattern
        const popularTests = await CompanyTestAttempt.aggregate([
            { $group: { _id: '$companyName', totalAttempts: { $sum: 1 }, avgScore: { $avg: '$score' }, avgAccuracy: { $avg: '$accuracy' } } },
            { $sort: { totalAttempts: -1 } }
        ]);

        res.json({ recentTests, popularTests });
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving admin test metrics' });
    }
};
