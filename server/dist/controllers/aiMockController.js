"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getStudentHistory = exports.getTestResult = exports.submitTest = exports.generateTest = void 0;
const AIMockService = __importStar(require("../services/aiMockGeneratorService"));
const AIMockTest_1 = __importDefault(require("../models/AIMockTest"));
const generateTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, difficulty, duration } = req.body;
        const studentId = req.user.id;
        const test = yield AIMockService.generateAIMockTest(studentId, type, difficulty, duration);
        res.status(201).json(test);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate test' });
    }
});
exports.generateTest = generateTest;
const submitTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { testId, answers } = req.body;
        const result = yield AIMockService.submitAIMockTest(testId, answers);
        res.json(result);
    }
    catch (error) {
        console.error(error);
        if (error.message === 'Test not found' || error.message === 'Test already submitted') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Submission failed' });
    }
});
exports.submitTest = submitTest;
const getTestResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const test = yield AIMockTest_1.default.findById(req.params.id).populate('questions.questionId');
        if (!test)
            return res.status(404).json({ message: 'Test not found' });
        res.json(test);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getTestResult = getTestResult;
const getStudentHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield AIMockTest_1.default.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .select('type difficulty totalScore maxScore createdAt readinessLevel');
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getStudentHistory = getStudentHistory;
