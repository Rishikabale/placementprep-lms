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
exports.getCompanyTestHistory = exports.getCompanyTestResult = exports.submitCompanyTest = exports.startCompanyTest = void 0;
const CompanyPattern_1 = __importDefault(require("../models/CompanyPattern"));
const Question_1 = __importDefault(require("../models/Question"));
const CompanyTestAttempt_1 = __importDefault(require("../models/CompanyTestAttempt"));
const startCompanyTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patternId } = req.params;
        const pattern = yield CompanyPattern_1.default.findById(patternId);
        if (!pattern) {
            res.status(404).json({ message: 'Pattern not found' });
            return;
        }
        const generatedTest = {
            pattern,
            questions: []
        };
        // For each section, fetch random questions
        for (const section of pattern.sections) {
            // Priority: Try to match company tag if applicable, else just match category
            let questions = yield Question_1.default.aggregate([
                { $match: { category: section.category } },
                { $sample: { size: section.questionCount } }
            ]);
            // Fallback: If not enough questions exist in this category, fill with generic questions
            if (questions.length < section.questionCount) {
                const existingIds = questions.map(q => q._id);
                const deficit = section.questionCount - questions.length;
                const extraQuestions = yield Question_1.default.aggregate([
                    { $match: { _id: { $nin: existingIds } } },
                    { $sample: { size: deficit } }
                ]);
                questions = [...questions, ...extraQuestions];
            }
            // Remove isCorrect flag from options so client doesn't see it
            const sanitizedQuestions = questions.map(q => {
                const options = q.options.map((opt) => ({
                    _id: opt._id,
                    text: opt.text
                }));
                // ensure we trace which section this question is assigned to
                return Object.assign(Object.assign({}, q), { options, sectionAssigned: section.sectionName });
            });
            generatedTest.questions.push(...sanitizedQuestions);
        }
        res.json(generatedTest);
    }
    catch (error) {
        console.error('Error generating company test:', error);
        res.status(500).json({ message: 'Server Error Generating Test' });
    }
});
exports.startCompanyTest = startCompanyTest;
const submitCompanyTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const studentId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || req.body.studentId;
        const { patternId, answers, timeSpent } = req.body;
        const pattern = yield CompanyPattern_1.default.findById(patternId);
        if (!pattern) {
            res.status(404).json({ message: 'Pattern not found' });
            return;
        }
        let totalScore = 0;
        let totalCorrect = 0;
        let totalQuestionsAttempted = answers.length;
        const sectionPerformance = {};
        // Initialize section performance map
        pattern.sections.forEach(sec => {
            sectionPerformance[sec.sectionName] = {
                score: 0,
                totalQuestions: sec.questionCount,
                correctAnswers: 0,
                weightage: sec.weightage
            };
        });
        const responses = [];
        for (const answer of answers) {
            const question = yield Question_1.default.findById(answer.questionId);
            if (!question)
                continue;
            const isCorrect = question.options.some(opt => { var _a; return ((_a = opt._id) === null || _a === void 0 ? void 0 : _a.toString()) === answer.selectedOptionId && opt.isCorrect; });
            // Re-map to section based on category for tracking
            const section = pattern.sections.find(sec => sec.category === question.category);
            const sectionName = section ? section.sectionName : pattern.sections[0].sectionName;
            const weightage = section ? section.weightage : 1;
            if (isCorrect) {
                totalScore += weightage;
                totalCorrect++;
                if (sectionPerformance[sectionName]) {
                    sectionPerformance[sectionName].score += weightage;
                    sectionPerformance[sectionName].correctAnswers++;
                }
            }
            else if (answer.selectedOptionId && pattern.negativeMarking) {
                totalScore -= pattern.negativeMarkValue;
                if (sectionPerformance[sectionName]) {
                    sectionPerformance[sectionName].score -= pattern.negativeMarkValue;
                }
            }
            responses.push({
                questionId: question._id,
                selectedOptionId: answer.selectedOptionId,
                isCorrect
            });
        }
        const totalAvailableQuestions = pattern.sections.reduce((acc, sec) => acc + sec.questionCount, 0);
        const accuracy = totalQuestionsAttempted > 0 ? (totalCorrect / totalQuestionsAttempted) * 100 : 0;
        let weakestSection = 'N/A';
        let lowestAcc = 101;
        const sectionScoresArray = Object.keys(sectionPerformance).map(name => {
            const sec = sectionPerformance[name];
            const secAcc = sec.totalQuestions > 0 ? (sec.correctAnswers / sec.totalQuestions) * 100 : 0;
            if (secAcc < lowestAcc && sec.totalQuestions > 0) {
                lowestAcc = secAcc;
                weakestSection = name;
            }
            return Object.assign({ sectionName: name }, sec);
        });
        const testAttempt = new CompanyTestAttempt_1.default({
            studentId,
            companyPatternId: patternId,
            companyName: pattern.name,
            score: Number(totalScore.toFixed(2)),
            accuracy: Math.round(accuracy * 100) / 100,
            timeSpent,
            sectionScores: sectionScoresArray,
            weakestSection,
            responses
        });
        const savedAttempt = yield testAttempt.save();
        res.status(201).json(savedAttempt);
    }
    catch (error) {
        console.error('Error submitting company test:', error);
        res.status(500).json({ message: 'Server Error Submitting Test' });
    }
});
exports.submitCompanyTest = submitCompanyTest;
const getCompanyTestResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attempt = yield CompanyTestAttempt_1.default.findById(req.params.id)
            .populate('companyPatternId')
            .populate({
            path: 'responses.questionId'
        });
        if (!attempt) {
            res.status(404).json({ message: 'Attempt not found' });
            return;
        }
        res.json(attempt);
    }
    catch (error) {
        console.error('Error fetching result:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCompanyTestResult = getCompanyTestResult;
const getCompanyTestHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!studentId) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const history = yield CompanyTestAttempt_1.default.find({ studentId }).sort({ createdAt: -1 });
        res.json(history);
    }
    catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCompanyTestHistory = getCompanyTestHistory;
