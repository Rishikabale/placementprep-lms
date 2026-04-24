import mongoose, { Document, Schema } from 'mongoose';

export interface IAIMockTest extends Document {
    student: mongoose.Schema.Types.ObjectId;
    type: 'Full Mock' | 'Aptitude Only' | 'Coding Only';
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive';
    duration: number; // in minutes
    totalScore: number;
    maxScore: number;
    percentile: number;
    readinessLevel: string;
    questions: {
        questionId: mongoose.Schema.Types.ObjectId;
        category: string;
        difficulty: string;
        selectedOption?: string;
        isCorrect?: boolean;
        timeSpent?: number;
    }[];
    createdAt: Date;
    completedAt?: Date;
}

const AIMockTestSchema: Schema = new Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Full Mock', 'Aptitude Only', 'Coding Only'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Adaptive'], default: 'Adaptive' },
    duration: { type: Number, required: true },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentile: { type: Number, default: 0 },
    readinessLevel: { type: String, default: 'Not Evaluated' },
    questions: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        category: { type: String },
        difficulty: { type: String },
        selectedOption: { type: String },
        isCorrect: { type: Boolean },
        timeSpent: { type: Number }
    }],
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

export default mongoose.model<IAIMockTest>('AIMockTest', AIMockTestSchema);
