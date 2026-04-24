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
exports.bulkUploadQuestions = exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = exports.getQuestions = void 0;
const Question_1 = __importDefault(require("../models/Question"));
// @desc    Get all questions (with optional filters)
// @route   GET /api/questions
// @access  Private/Instructor
const getQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, difficulty, type } = req.query;
        let query = {};
        if (category)
            query.category = category;
        if (difficulty)
            query.difficulty = difficulty;
        if (type)
            query.type = type;
        // Pagination setup
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const totalQuestions = yield Question_1.default.countDocuments(query);
        const questions = yield Question_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.json({
            questions,
            currentPage: page,
            totalPages: Math.ceil(totalQuestions / limit),
            totalQuestions
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.getQuestions = getQuestions;
// @desc    Create a new question
// @route   POST /api/questions
// @access  Private/Instructor
const createQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = yield Question_1.default.create(req.body);
        res.status(201).json(question);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.createQuestion = createQuestion;
// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Instructor
const updateQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = yield Question_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }
        res.json(question);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.updateQuestion = updateQuestion;
// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Instructor
const deleteQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = yield Question_1.default.findByIdAndDelete(req.params.id);
        if (!question) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }
        res.json({ message: 'Question removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.deleteQuestion = deleteQuestion;
// @desc    Bulk upload questions from CSV
// @route   POST /api/questions/bulk-upload
// @access  Private/Instructor
const csv_parser_1 = __importDefault(require("csv-parser"));
const stream_1 = require("stream");
const bulkUploadQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const results = [];
        const bufferStream = new stream_1.Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => {
            // Ignore empty rows
            if (!data.QuestionText)
                return;
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
            .on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            if (results.length === 0) {
                res.status(400).json({ message: 'CSV file is empty or missing QuestionText column' });
                return;
            }
            const inserted = yield Question_1.default.insertMany(results);
            res.status(201).json({ message: `Successfully uploaded ${inserted.length} questions` });
        }));
    }
    catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ message: 'Server Error during bulk upload' });
    }
});
exports.bulkUploadQuestions = bulkUploadQuestions;
