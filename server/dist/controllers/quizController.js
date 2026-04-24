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
exports.updateQuiz = exports.getQuizResults = exports.submitQuizAttempt = exports.getQuizById = exports.createQuiz = void 0;
const Quiz_1 = __importDefault(require("../models/Quiz"));
const Question_1 = __importDefault(require("../models/Question"));
const Progress_1 = __importDefault(require("../models/Progress"));
const createQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, questions, duration, passingScore, type, relatedVideo } = req.body;
        // 1. Create Question documents first
        const questionIds = [];
        if (questions && questions.length > 0) {
            for (const q of questions) {
                const question = new Question_1.default(q);
                const savedQ = yield question.save();
                questionIds.push(savedQ._id);
            }
        }
        // 2. Create Quiz with question IDs
        const quiz = new Quiz_1.default({
            title,
            description,
            questions: questionIds,
            duration,
            passingScore,
            type,
            relatedVideo
        });
        const createdQuiz = yield quiz.save();
        // 3. If relatedVideo is provided, update the Video document
        if (relatedVideo) {
            const VideoModel = require('../models/Video').default;
            yield VideoModel.findByIdAndUpdate(relatedVideo, { quizId: createdQuiz._id });
        }
        res.status(201).json(createdQuiz);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.createQuiz = createQuiz;
const getQuizById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quiz = yield Quiz_1.default.findById(req.params.id).populate({ path: 'questions', model: Question_1.default });
        if (quiz) {
            res.json(quiz);
        }
        else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    }
    catch (error) {
        console.error("Error in getQuizById:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.getQuizById = getQuizById;
const submitQuizAttempt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizId, answers } = req.body; // answers: { questionId: optionText }[]
        const studentId = req.user._id;
        const quiz = yield Quiz_1.default.findById(quizId).populate({ path: 'questions', model: Question_1.default });
        if (!quiz)
            return res.status(404).json({ message: "Quiz not found" });
        let score = 0;
        let totalQuestions = quiz.questions.length;
        // Simple grading logic
        quiz.questions.forEach((q) => {
            const studentAnswer = answers[q._id.toString()];
            const correctOption = q.options.find((o) => o.isCorrect);
            if (correctOption && studentAnswer === correctOption.text) {
                score++;
            }
        });
        const percentage = (score / totalQuestions) * 100;
        const passed = percentage >= quiz.passingScore;
        // Update Progress
        let progress = yield Progress_1.default.findOne({ student: studentId });
        if (!progress) {
            progress = new Progress_1.default({ student: studentId });
        }
        progress.quizScores.push({
            quizId: quiz._id,
            score: percentage,
            passed: passed,
            attemptDate: new Date()
        });
        // Add to aptitude/coding scores if applicable
        if (quiz.type === 'APTITUDE_TEST') {
            // Heuristic: identify category from tags or title
            progress.aptitudeScores.push({ testId: quiz._id, category: 'General', score: percentage });
        }
        else if (quiz.type === 'CODING_TEST') {
            progress.codingTestScores.push({ testId: quiz._id, score: percentage, passed });
        }
        yield progress.save();
        res.json({ score, percentage, passed });
    }
    catch (err) {
        res.status(500).json({ message: 'Server Error', error: err });
    }
});
exports.submitQuizAttempt = submitQuizAttempt;
const mongoose_1 = __importDefault(require("mongoose"));
const getQuizResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quizId = req.params.id;
        console.log(`[getQuizResults] Fetching results for quiz: ${quizId}`);
        if (!mongoose_1.default.Types.ObjectId.isValid(quizId)) {
            console.warn(`[getQuizResults] Invalid Quiz ID: ${quizId}`);
            return res.status(400).json({ message: "Invalid Quiz ID" });
        }
        // Find all progress records that have an entry for this quizId
        const progressRecords = yield Progress_1.default.find({
            'quizScores.quizId': quizId
        }).populate('student', 'name email');
        console.log(`[getQuizResults] Found ${progressRecords.length} progress records`);
        // Extract relevant info
        const results = progressRecords.map((p) => {
            try {
                if (!p || !p.quizScores)
                    return null;
                // Filter specific quiz scores safely
                const attempts = p.quizScores.filter((qs) => qs && qs.quizId && qs.quizId.toString() === quizId);
                // If we found the record by query, attempts should theoretically not be empty, 
                // but let's allow empty attempts if data is inconsistent
                return {
                    student: p.student,
                    attempts
                };
            }
            catch (err) {
                console.error(`[getQuizResults] Error processing record ${p._id}:`, err);
                return null;
            }
        }).filter(item => item !== null);
        res.json(results);
    }
    catch (error) {
        console.error("[getQuizResults] Error:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.getQuizResults = getQuizResults;
const updateQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description, questions, duration, passingScore } = req.body; // questions is array of objects
        const quiz = yield Quiz_1.default.findById(id);
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
                    yield Question_1.default.findByIdAndUpdate(q._id, q);
                    newQuestionIds.push(q._id);
                }
                else {
                    // Create new question
                    const newQ = new Question_1.default(q);
                    const savedQ = yield newQ.save();
                    newQuestionIds.push(savedQ._id);
                }
            }
            quiz.questions = newQuestionIds;
        }
        const updatedQuiz = yield quiz.save();
        res.json(updatedQuiz);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.updateQuiz = updateQuiz;
