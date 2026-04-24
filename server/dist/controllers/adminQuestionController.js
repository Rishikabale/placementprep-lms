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
exports.deleteQuestion = exports.bulkUploadQuestions = exports.getAdminQuestions = void 0;
const Question_1 = __importDefault(require("../models/Question"));
// @desc    Get all questions (with advanced filtering)
// @route   GET /api/admin/questions
// @access  Private/Admin
const getAdminQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, difficulty, companyTags, search, page = 1, limit = 50 } = req.query;
        let query = {};
        if (category)
            query.category = category;
        if (difficulty)
            query.difficulty = difficulty;
        if (companyTags)
            query.companyTags = { $in: companyTags.split(',') };
        if (search)
            query.text = { $regex: search, $options: 'i' };
        const skip = (Number(page) - 1) * Number(limit);
        const questions = yield Question_1.default.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
        const total = yield Question_1.default.countDocuments(query);
        res.json({ questions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error retrieving questions' });
    }
});
exports.getAdminQuestions = getAdminQuestions;
// @desc    Bulk Upload Questions (JSON/CSV emulation)
// @route   POST /api/admin/questions/bulk
// @access  Private/Admin
const bulkUploadQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { questions } = req.body;
        if (!Array.isArray(questions) || questions.length === 0) {
            res.status(400).json({ message: 'Invalid or empty questions array' });
            return;
        }
        const inserted = yield Question_1.default.insertMany(questions);
        res.status(201).json({ message: `Successfully inserted ${inserted.length} questions`, insertedCount: inserted.length });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during bulk upload' });
    }
});
exports.bulkUploadQuestions = bulkUploadQuestions;
// @desc    Delete Question
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
const deleteQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Question_1.default.findByIdAndDelete(req.params.id);
        if (!result) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }
        res.json({ message: 'Question deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error deleting question' });
    }
});
exports.deleteQuestion = deleteQuestion;
