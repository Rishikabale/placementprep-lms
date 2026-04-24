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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MockTestResultSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    pattern: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CompanyPattern', required: true },
    totalScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    percentile: { type: Number, default: 0 },
    readinessLevel: {
        type: String,
        enum: ['High Risk', 'Needs Improvement', 'Moderately Ready', 'Highly Ready'],
        default: 'Needs Improvement'
    },
    timeTaken: { type: Number, default: 0 },
    sectionResults: [{
            sectionName: String,
            totalQuestions: Number,
            attempted: Number,
            correct: Number,
            incorrect: Number,
            score: Number,
            timeSpent: Number
        }],
    answers: [{
            questionId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Question' },
            selectedOption: String,
            isCorrect: Boolean,
            timeSpent: Number
        }],
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });
exports.default = mongoose_1.default.model('MockTestResult', MockTestResultSchema);
