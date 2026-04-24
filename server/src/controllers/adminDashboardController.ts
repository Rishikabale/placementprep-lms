import { Request, Response } from 'express';
import User from '../models/User';
import Course from '../models/Course';
import CompanyTestAttempt from '../models/CompanyTestAttempt';
import ResumeAnalysis from '../models/ResumeAnalysis';

// @desc    Get Admin Dashboard Overview Stats & Activity
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getAdminDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. System Overview Cards
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalInstructors = await User.countDocuments({ role: 'instructor' });
        const totalCourses = await Course.countDocuments();
        
        // Count total company test attempts
        const totalTestsTaken = await CompanyTestAttempt.countDocuments();

        // Calculate Average Placement Readiness (using Resume Score as a proxy, could be expanded)
        let avgPlacementReadiness = 0;
        const avgResumeResult = await ResumeAnalysis.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
        ]);
        if (avgResumeResult.length > 0) {
            avgPlacementReadiness = Math.round(avgResumeResult[0].avgScore);
        }

        // 2. Activity Overview
        const recentUsers = await User.find({ role: 'student' })
            .select('-password').sort({ createdAt: -1 }).limit(5);

        const recentTestAttempts = await CompanyTestAttempt.find()
            .populate('studentId', 'name email').sort({ createdAt: -1 }).limit(5);

        const recentResumes = await ResumeAnalysis.find()
            .populate('studentId', 'name email').sort({ createdAt: -1 }).limit(5);

        // 3. Performance Snapshot
        // We can aggregate section scores (Quant vs Coding) but schema currently stores weakestSection text.
        // Let's get generic averages overall Tests
        const avgScores = await CompanyTestAttempt.aggregate([
            { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' }, avgTotalScore: { $avg: '$score' } } }
        ]);

        const avgAptitudeAccuracy = avgScores.length > 0 ? Math.round(avgScores[0].avgAccuracy) : 0;

        // 4. Alerts Panel
        const atRiskStudentsResult = await ResumeAnalysis.aggregate([
            { $match: { totalScore: { $lt: 40 } } },
            { $sort: { totalScore: 1 } },
            { $limit: 10 }
        ]);
        
        // Populate standard Mongoose way for aggregated results manually or return raw
        const atRiskStudents = await ResumeAnalysis.populate(atRiskStudentsResult, { path: 'studentId', select: 'name email' });

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
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).json({ message: 'Server error loading admin dashboard stats' });
    }
};
