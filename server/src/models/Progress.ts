import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
    student: mongoose.Schema.Types.ObjectId;
    completedVideos: mongoose.Schema.Types.ObjectId[];
    quizScores: {
        quizId: mongoose.Schema.Types.ObjectId;
        score: number;
        passed: boolean;
        attemptDate: Date;
    }[];
    codingTestScores: {
        testId: mongoose.Schema.Types.ObjectId;
        score: number;
        passed: boolean;
    }[];
    aptitudeScores: {
        testId: mongoose.Schema.Types.ObjectId;
        category: string; // e.g. "Quant"
        score: number;
    }[];
    placementReadiness: number; // 0-100 score calculated by AI
}

const ProgressSchema: Schema = new Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    completedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    quizScores: [{
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: Number,
        passed: Boolean,
        attemptDate: { type: Date, default: Date.now }
    }],
    codingTestScores: [{
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: Number,
        passed: Boolean
    }],
    aptitudeScores: [{
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        category: String,
        score: Number
    }],
    placementReadiness: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IProgress>('Progress', ProgressSchema);
