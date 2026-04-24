import { Request, Response } from 'express';
import Question from '../models/Question';

// @desc    Get all questions (with advanced filtering)
// @route   GET /api/admin/questions
// @access  Private/Admin
export const getAdminQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, difficulty, companyTags, search, page = 1, limit = 50 } = req.query;
        let query: any = {};

        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (companyTags) query.companyTags = { $in: (companyTags as string).split(',') };
        if (search) query.text = { $regex: search, $options: 'i' };

        const skip = (Number(page) - 1) * Number(limit);

        const questions = await Question.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
        const total = await Question.countDocuments(query);

        res.json({ questions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving questions' });
    }
};

// @desc    Bulk Upload Questions (JSON/CSV emulation)
// @route   POST /api/admin/questions/bulk
// @access  Private/Admin
export const bulkUploadQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { questions } = req.body;
        if (!Array.isArray(questions) || questions.length === 0) {
            res.status(400).json({ message: 'Invalid or empty questions array' });
            return;
        }

        const inserted = await Question.insertMany(questions);
        res.status(201).json({ message: `Successfully inserted ${inserted.length} questions`, insertedCount: inserted.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error during bulk upload' });
    }
};

// @desc    Delete Question
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await Question.findByIdAndDelete(req.params.id);
        if (!result) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting question' });
    }
};
