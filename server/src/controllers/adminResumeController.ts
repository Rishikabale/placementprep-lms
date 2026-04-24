import { Request, Response } from 'express';
import ResumeAnalysis from '../models/ResumeAnalysis';

// @desc    View Resume Analyzer Trends
// @route   GET /api/admin/resumes
// @access  Private/Admin
export const getAdminResumeTrends = async (req: Request, res: Response): Promise<void> => {
    try {
        // Average scores across distinct sections
        const avgSectionScores = await ResumeAnalysis.aggregate([
            { $unwind: "$sectionScores" },
            { $group: { _id: "$sectionScores.sectionName", avgScore: { $avg: "$sectionScores.score" } } }
        ]);

        // Most common weaknesses (simple flattening and grouping)
        const commonWeaknesses = await ResumeAnalysis.aggregate([
            { $unwind: "$weaknesses" },
            { $group: { _id: "$weaknesses", frequency: { $sum: 1 } } },
            { $sort: { frequency: -1 } },
            { $limit: 10 }
        ]);

        // Most common tracked technical skills
        const topSkills = await ResumeAnalysis.aggregate([
            { $unwind: "$extractedSkills" },
            { $group: { _id: "$extractedSkills", frequency: { $sum: 1 } } },
            { $sort: { frequency: -1 } },
            { $limit: 15 }
        ]);

        res.json({ avgSectionScores, commonWeaknesses, topSkills });
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving resume trends' });
    }
};
