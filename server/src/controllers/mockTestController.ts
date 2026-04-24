import { Request, Response } from 'express';
import CompanyPattern from '../models/CompanyPattern';
import Question from '../models/Question';
import MockTestResult from '../models/MockTestResult';

// @desc    Generate a new mock test based on pattern
// @route   POST /api/mock-tests/generate
// @access  Private
export const generateMockTest = async (req: Request, res: Response) => {
    try {
        const { patternId } = req.body;
        const pattern = await CompanyPattern.findById(patternId);

        if (!pattern) return res.status(404).json({ message: 'Pattern not found' });

        let testQuestions: any[] = [];

        // For each section in the pattern, pick random questions
        for (const section of pattern.sections) {
            // Find questions matching category
            // Ideally we also match difficulty if specified, or mix them
            const query: any = { category: section.category };
            if (section.difficulty) {
                query.difficulty = section.difficulty;
            }

            // Using aggregation to sample random questions
            const randomQuestions = await Question.aggregate([
                { $match: query },
                { $sample: { size: section.questionCount } }
            ]);

            // If not enough questions, we might just return what we have (or error out in strict mode)
            // For now, we attach section metadata to these questions for the frontend
            const questionsWithMeta = randomQuestions.map(q => ({
                ...q,
                sectionName: section.sectionName,
                weightage: section.weightage
            }));

            testQuestions = [...testQuestions, ...questionsWithMeta];
        }

        res.json({
            pattern,
            questions: testQuestions
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Submit a mock test attempt
// @route   POST /api/mock-tests/submit
// @access  Private
export const submitMockTest = async (req: Request, res: Response) => {
    try {
        const { patternId, answers, timeTaken } = req.body; // answers: { questionId, selectedOption, timeSpent }[]
        const studentId = (req as any).user._id;

        const pattern = await CompanyPattern.findById(patternId);
        if (!pattern) return res.status(404).json({ message: 'Pattern not found' });

        let totalScore = 0;
        let maxScore = 0;
        const sectionResultsMap: any = {};

        // 1. Calculate Score
        // We need to fetch all questions to verify correct answers and get weightage
        // Optimization: Fetch only relevant questions
        const questionIds = answers.map((a: any) => a.questionId);
        const questionsDB = await Question.find({ _id: { $in: questionIds } });

        // Helper to find question and section info
        // We need to map questions back to sections to calculate section scores. 
        // This is tricky because a question might just be "Quant", but which pattern section did it belong to?
        // Assumption: The 'answers' payload or 'Question' model doesn't strictly link to a specific pattern 'section object'.
        // However, we can map by 'category'.

        // Initialize section results based on pattern
        pattern.sections.forEach(s => {
            sectionResultsMap[s.sectionName] = {
                sectionName: s.sectionName,
                totalQuestions: s.questionCount,
                attempted: 0,
                correct: 0,
                incorrect: 0,
                score: 0,
                timeSpent: 0,
                category: s.category,
                weightage: s.weightage
            };
            maxScore += (s.questionCount * s.weightage);
        });

        const detailedAnswers = [];

        for (const ans of answers) {
            const question = questionsDB.find(q => q._id.toString() === ans.questionId);
            if (!question) continue;

            // Find which section this question likely belongs to based on category
            // If multiple sections have same category, we might just add to the first matching one or split. 
            // For simplicity, we assume unique categories per section or we just pick first match.
            const sectionName = pattern.sections.find(s => s.category === question.category as any)?.sectionName;

            if (sectionName && sectionResultsMap[sectionName]) {
                const sec = sectionResultsMap[sectionName];
                sec.attempted++;
                sec.timeSpent += ans.timeSpent || 0;

                const correctOption = question.options.find(o => o.isCorrect);
                const isCorrect = correctOption && correctOption.text === ans.selectedOption;

                if (isCorrect) {
                    sec.correct++;
                    const points = sec.weightage;
                    sec.score += points;
                    totalScore += points;
                } else {
                    sec.incorrect++;
                    if (pattern.negativeMarking) {
                        const deduction = pattern.negativeMarkValue || 0;
                        sec.score -= deduction;
                        totalScore -= deduction;
                    }
                }

                detailedAnswers.push({
                    questionId: question._id,
                    selectedOption: ans.selectedOption,
                    isCorrect: !!isCorrect,
                    timeSpent: ans.timeSpent
                });
            }
        }

        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

        // 2. Readiness Level
        let readinessLevel = 'Needs Improvement';
        if (percentage >= 80) readinessLevel = 'Highly Ready';
        else if (percentage >= 60) readinessLevel = 'Moderately Ready';
        else if (percentage < 40) readinessLevel = 'High Risk';

        // 3. Percentile Calculation
        // Count how many students scored strictly less than this student on this pattern
        const totalAttempts = await MockTestResult.countDocuments({ pattern: patternId });
        const studentsBelow = await MockTestResult.countDocuments({ pattern: patternId, totalScore: { $lt: totalScore } });

        // Logic: allow current attempt to be part of population?
        // Usually percentile = (studentsBelow / totalAttemptsIncludingCurrent) * 100
        const realTotal = totalAttempts + 1;
        const percentile = (studentsBelow / realTotal) * 100;

        // Save Result
        const result = new MockTestResult({
            student: studentId,
            pattern: patternId,
            totalScore: totalScore < 0 ? 0 : totalScore, // Floor at 0? Or allow negative? usually floor total at 0
            maxScore,
            percentage,
            percentile,
            readinessLevel,
            timeTaken,
            sectionResults: Object.values(sectionResultsMap),
            answers: detailedAnswers
        });

        await result.save();

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get user's mock test history
// @route   GET /api/mock-tests/history
// @access  Private
export const getMockTestHistory = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user._id;
        const results = await MockTestResult.find({ student: studentId })
            .populate('pattern', 'name')
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single result details
// @route   GET /api/mock-tests/results/:id
// @access  Private
export const getMockTestResultById = async (req: Request, res: Response) => {
    try {
        const result = await MockTestResult.findById(req.params.id).populate('pattern', 'name');
        if (!result) return res.status(404).json({ message: 'Result not found' });

        // Ensure user owns result or is admin/instructor
        // skipped strict check for prototype
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
