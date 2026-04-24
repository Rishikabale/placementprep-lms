import mongoose, { Schema, Document } from 'mongoose';

export interface IMockTestResult extends Document {
    student: mongoose.Schema.Types.ObjectId;
    pattern: mongoose.Schema.Types.ObjectId; // Link to CompanyPattern
    totalScore: number;
    maxScore: number;
    percentage: number;
    percentile: number; // Calculated relative to other students
    readinessLevel: 'High Risk' | 'Needs Improvement' | 'Moderately Ready' | 'Highly Ready';
    timeTaken: number; // in seconds
    sectionResults: {
        sectionName: string;
        totalQuestions: number;
        attempted: number;
        correct: number;
        incorrect: number;
        score: number;
        timeSpent: number; // in seconds
    }[];
    answers: {
        questionId: mongoose.Schema.Types.ObjectId;
        selectedOption: string;
        isCorrect: boolean;
        timeSpent: number;
    }[];
    completedAt: Date;
}

const MockTestResultSchema: Schema = new Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pattern: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyPattern', required: true },
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
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedOption: String,
        isCorrect: Boolean,
        timeSpent: Number
    }],
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IMockTestResult>('MockTestResult', MockTestResultSchema);
