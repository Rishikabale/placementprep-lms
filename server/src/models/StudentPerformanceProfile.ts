import mongoose, { Document, Schema } from 'mongoose';

// Adaptive Index: A number likely between 0 and 100 representing skill level
// 0-30: Novice (Needs Easy), 30-70: Intermediate (Needs Medium), 70+: Expert (Needs Hard)

export interface IStudentPerformanceProfile extends Document {
    student: mongoose.Schema.Types.ObjectId;
    adaptiveIndex: {
        Quant: number;
        Logical: number;
        Verbal: number;
        Coding: number;
    };
    weakTopics: string[];
    history: {
        testId: mongoose.Schema.Types.ObjectId;
        score: number;
        date: Date;
    }[];
    lastUpdated: Date;
}

const StudentPerformanceProfileSchema: Schema = new Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    adaptiveIndex: {
        Quant: { type: Number, default: 30 }, // Start at relatively easy
        Logical: { type: Number, default: 30 },
        Verbal: { type: Number, default: 30 },
        Coding: { type: Number, default: 30 }
    },
    weakTopics: [{ type: String }],
    history: [{
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIMockTest' },
        score: { type: Number },
        date: { type: Date }
    }],
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model<IStudentPerformanceProfile>('StudentPerformanceProfile', StudentPerformanceProfileSchema);
