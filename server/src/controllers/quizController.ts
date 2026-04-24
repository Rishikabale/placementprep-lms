import { Request, Response } from 'express';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import Progress from '../models/Progress';

export const createQuiz = async (req: Request, res: Response) => {
    try {
        const { title, description, questions, duration, passingScore, type, relatedVideo } = req.body;

        // 1. Create Question documents first
        const questionIds = [];
        if (questions && questions.length > 0) {
            for (const q of questions) {
                const question = new Question(q);
                const savedQ = await question.save();
                questionIds.push(savedQ._id);
            }
        }

        // 2. Create Quiz with question IDs
        const quiz = new Quiz({
            title,
            description,
            questions: questionIds,
            duration,
            passingScore,
            type,
            relatedVideo
        });

        const createdQuiz = await quiz.save();

        // 3. If relatedVideo is provided, update the Video document
        if (relatedVideo) {
            const VideoModel = require('../models/Video').default;
            await VideoModel.findByIdAndUpdate(relatedVideo, { quizId: createdQuiz._id });
        }

        res.status(201).json(createdQuiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getQuizById = async (req: Request, res: Response) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate({ path: 'questions', model: Question });
        if (quiz) {
            res.json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        console.error("Error in getQuizById:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const submitQuizAttempt = async (req: Request, res: Response) => {
    try {
        const { quizId, answers } = req.body; // answers: { questionId: optionText }[]
        const studentId = (req as any).user._id;

        const quiz = await Quiz.findById(quizId).populate({ path: 'questions', model: Question });
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        let score = 0;
        let totalQuestions = quiz.questions.length;

        // Simple grading logic
        (quiz.questions as any).forEach((q: any) => {
            const studentAnswer = answers[q._id.toString()];
            const correctOption = q.options.find((o: any) => o.isCorrect);
            if (correctOption && studentAnswer === correctOption.text) {
                score++;
            }
        });

        const percentage = (score / totalQuestions) * 100;
        const passed = percentage >= quiz.passingScore;

        // Update Progress
        let progress = await Progress.findOne({ student: studentId });
        if (!progress) {
            progress = new Progress({ student: studentId });
        }

        progress.quizScores.push({
            quizId: quiz._id as any,
            score: percentage,
            passed: passed,
            attemptDate: new Date()
        });

        // Add to aptitude/coding scores if applicable
        if (quiz.type === 'APTITUDE_TEST') {
            // Heuristic: identify category from tags or title
            progress.aptitudeScores.push({ testId: quiz._id as any, category: 'General', score: percentage });
        } else if (quiz.type === 'CODING_TEST') {
            progress.codingTestScores.push({ testId: quiz._id as any, score: percentage, passed });
        }

        await progress.save();

        res.json({ score, percentage, passed });

    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err });
    }
}

import mongoose from 'mongoose';

export const getQuizResults = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.id as string;
        console.log(`[getQuizResults] Fetching results for quiz: ${quizId}`);

        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            console.warn(`[getQuizResults] Invalid Quiz ID: ${quizId}`);
            return res.status(400).json({ message: "Invalid Quiz ID" });
        }

        // Find all progress records that have an entry for this quizId
        const progressRecords = await Progress.find({
            'quizScores.quizId': quizId
        } as any).populate('student', 'name email');

        console.log(`[getQuizResults] Found ${progressRecords.length} progress records`);

        // Extract relevant info
        const results = progressRecords.map((p: any) => {
            try {
                if (!p || !p.quizScores) return null;

                // Filter specific quiz scores safely
                const attempts = p.quizScores.filter((qs: any) =>
                    qs && qs.quizId && qs.quizId.toString() === quizId
                );

                // If we found the record by query, attempts should theoretically not be empty, 
                // but let's allow empty attempts if data is inconsistent
                return {
                    student: p.student,
                    attempts
                };
            } catch (err) {
                console.error(`[getQuizResults] Error processing record ${p._id}:`, err);
                return null;
            }
        }).filter(item => item !== null);

        res.json(results);
    } catch (error) {
        console.error("[getQuizResults] Error:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, questions, duration, passingScore } = req.body; // questions is array of objects

        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // 1. Update basic fields
        quiz.title = title || quiz.title;
        quiz.description = description || quiz.description;
        quiz.duration = duration || quiz.duration;
        quiz.passingScore = passingScore || quiz.passingScore;

        // 2. Handle Questions Update
        if (questions && Array.isArray(questions)) {
            const newQuestionIds = [];
            for (const q of questions) {
                if (q._id) {
                    // Update existing question
                    await Question.findByIdAndUpdate(q._id, q);
                    newQuestionIds.push(q._id);
                } else {
                    // Create new question
                    const newQ = new Question(q);
                    const savedQ = await newQ.save();
                    newQuestionIds.push(savedQ._id);
                }
            }
            quiz.questions = newQuestionIds as any;
        }

        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
