import { Request, Response } from 'express';
import Question from '../models/Question';

// @desc    Get all questions (with optional filters)
// @route   GET /api/questions
// @access  Private/Instructor
export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { category, difficulty, type } = req.query;
        let query: any = {};

        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (type) query.type = type;

        // Pagination setup
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        const totalQuestions = await Question.countDocuments(query);
        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            questions,
            currentPage: page,
            totalPages: Math.ceil(totalQuestions / limit),
            totalQuestions
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private/Instructor
export const createQuestion = async (req: Request, res: Response) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Instructor
export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Instructor
export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }
        res.json({ message: 'Question removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Bulk upload questions from CSV
// @route   POST /api/questions/bulk-upload
// @access  Private/Instructor
import csvParser from 'csv-parser';
import { Readable } from 'stream';

export const bulkUploadQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const results: any[] = [];
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);

        bufferStream
            .pipe(csvParser())
            .on('data', (data) => {
                // Ignore empty rows
                if (!data.QuestionText) return;
                
                const options = [
                    { text: data.Option1, isCorrect: data.CorrectOption === 'Option1' || data.CorrectOption === '1' },
                    { text: data.Option2, isCorrect: data.CorrectOption === 'Option2' || data.CorrectOption === '2' },
                    { text: data.Option3, isCorrect: data.CorrectOption === 'Option3' || data.CorrectOption === '3' },
                    { text: data.Option4, isCorrect: data.CorrectOption === 'Option4' || data.CorrectOption === '4' }
                ].filter(opt => opt.text && opt.text.trim() !== '');

                const question = {
                    text: data.QuestionText,
                    type: 'MCQ',
                    options,
                    category: data.Category || 'Generic',
                    difficulty: data.Difficulty || 'Medium',
                    tags: ['BulkUpload'],
                    isGenerated: false
                };
                results.push(question);
            })
            .on('end', async () => {
                if (results.length === 0) {
                     res.status(400).json({ message: 'CSV file is empty or missing QuestionText column' });
                     return;
                }
                const inserted = await Question.insertMany(results);
                res.status(201).json({ message: `Successfully uploaded ${inserted.length} questions` });
            });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ message: 'Server Error during bulk upload' });
    }
};
