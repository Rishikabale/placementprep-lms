import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyTestAttempt extends Document {
    studentId: mongoose.Types.ObjectId;
    companyPatternId: mongoose.Types.ObjectId;
    companyName: string;
    score: number;
    accuracy: number; // percentage
    timeSpent: number; // in seconds
    sectionScores: {
        sectionName: string;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
    }[];
    weakestSection?: string;
    responses: {
        questionId: mongoose.Types.ObjectId;
        selectedOptionId?: mongoose.Types.ObjectId;
        isCorrect: boolean;
        timeTaken?: number;
    }[];
    createdAt: Date;
}

const CompanyTestAttemptSchema: Schema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyPatternId: { type: Schema.Types.ObjectId, ref: 'CompanyPattern', required: true },
    companyName: { type: String, required: true },
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeSpent: { type: Number, required: true },
    sectionScores: [{
        sectionName: { type: String, required: true },
        score: { type: Number, required: true },
        totalQuestions: { type: Number, required: true },
        correctAnswers: { type: Number, required: true }
    }],
    weakestSection: { type: String },
    responses: [{
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedOptionId: { type: Schema.Types.ObjectId },
        isCorrect: { type: Boolean, required: true },
        timeTaken: { type: Number }
    }]
}, { timestamps: true });

export default mongoose.model<ICompanyTestAttempt>('CompanyTestAttempt', CompanyTestAttemptSchema);
