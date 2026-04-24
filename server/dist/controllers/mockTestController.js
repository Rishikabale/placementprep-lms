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
exports.getMockTestResultById = exports.getMockTestHistory = exports.submitMockTest = exports.generateMockTest = void 0;
const CompanyPattern_1 = __importDefault(require("../models/CompanyPattern"));
const Question_1 = __importDefault(require("../models/Question"));
const MockTestResult_1 = __importDefault(require("../models/MockTestResult"));
// @desc    Generate a new mock test based on pattern
// @route   POST /api/mock-tests/generate
// @access  Private
const generateMockTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patternId } = req.body;
        const pattern = yield CompanyPattern_1.default.findById(patternId);
        if (!pattern)
            return res.status(404).json({ message: 'Pattern not found' });
        let testQuestions = [];
        // For each section in the pattern, pick random questions
        for (const section of pattern.sections) {
            // Find questions matching category
            // Ideally we also match difficulty if specified, or mix them
            const query = { category: section.category };
            if (section.difficulty) {
                query.difficulty = section.difficulty;
            }
            // Using aggregation to sample random questions
            const randomQuestions = yield Question_1.default.aggregate([
                { $match: query },
                { $sample: { size: section.questionCount } }
            ]);
            // If not enough questions, we might just return what we have (or error out in strict mode)
            // For now, we attach section metadata to these questions for the frontend
            const questionsWithMeta = randomQuestions.map(q => (Object.assign(Object.assign({}, q), { sectionName: section.sectionName, weightage: section.weightage })));
            testQuestions = [...testQuestions, ...questionsWithMeta];
        }
        res.json({
            pattern,
            questions: testQuestions
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.generateMockTest = generateMockTest;
// @desc    Submit a mock test attempt
// @route   POST /api/mock-tests/submit
// @access  Private
const submitMockTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { patternId, answers, timeTaken } = req.body; // answers: { questionId, selectedOption, timeSpent }[]
        const studentId = req.user._id;
        const pattern = yield CompanyPattern_1.default.findById(patternId);
        if (!pattern)
            return res.status(404).json({ message: 'Pattern not found' });
        let totalScore = 0;
        let maxScore = 0;
        const sectionResultsMap = {};
        // 1. Calculate Score
        // We need to fetch all questions to verify correct answers and get weightage
        // Optimization: Fetch only relevant questions
        const questionIds = answers.map((a) => a.questionId);
        const questionsDB = yield Question_1.default.find({ _id: { $in: questionIds } });
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
            if (!question)
                continue;
            // Find which section this question likely belongs to based on category
            // If multiple sections have same category, we might just add to the first matching one or split. 
            // For simplicity, we assume unique categories per section or we just pick first match.
            const sectionName = (_a = pattern.sections.find(s => s.category === question.category)) === null || _a === void 0 ? void 0 : _a.sectionName;
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
                }
                else {
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
        if (percentage >= 80)
            readinessLevel = 'Highly Ready';
        else if (percentage >= 60)
            readinessLevel = 'Moderately Ready';
        else if (percentage < 40)
            readinessLevel = 'High Risk';
        // 3. Percentile Calculation
        // Count how many students scored strictly less than this student on this pattern
        const totalAttempts = yield MockTestResult_1.default.countDocuments({ pattern: patternId });
        const studentsBelow = yield MockTestResult_1.default.countDocuments({ pattern: patternId, totalScore: { $lt: totalScore } });
        // Logic: allow current attempt to be part of population?
        // Usually percentile = (studentsBelow / totalAttemptsIncludingCurrent) * 100
        const realTotal = totalAttempts + 1;
        const percentile = (studentsBelow / realTotal) * 100;
        // Save Result
        const result = new MockTestResult_1.default({
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
        yield result.save();
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.submitMockTest = submitMockTest;
// @desc    Get user's mock test history
// @route   GET /api/mock-tests/history
// @access  Private
const getMockTestHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = req.user._id;
        const results = yield MockTestResult_1.default.find({ student: studentId })
            .populate('pattern', 'name')
            .sort({ createdAt: -1 });
        res.json(results);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getMockTestHistory = getMockTestHistory;
// @desc    Get single result details
// @route   GET /api/mock-tests/results/:id
// @access  Private
const getMockTestResultById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield MockTestResult_1.default.findById(req.params.id).populate('pattern', 'name');
        if (!result)
            return res.status(404).json({ message: 'Result not found' });
        // Ensure user owns result or is admin/instructor
        // skipped strict check for prototype
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getMockTestResultById = getMockTestResultById;
