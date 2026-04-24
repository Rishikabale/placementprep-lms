import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
    text: string;
    options: {
        _id?: mongoose.Types.ObjectId;
        text: string;
        isCorrect: boolean;
    }[];
    explanation?: string;
    type: 'MCQ' | 'CODING';
    tags: string[]; // e.g. "Arrays", "Logical", "Verbal"
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: 'Quant' | 'Logical' | 'Verbal' | 'Coding';
    companyTags: string[];
    isGenerated?: boolean;
}

const QuestionSchema: Schema = new Schema({
    text: { type: String, required: true },
    options: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true }
    }],
    explanation: { type: String },
    type: { type: String, enum: ['MCQ', 'CODING'], default: 'MCQ' },
    tags: [{ type: String }],
    category: { type: String, enum: ['Quant', 'Logical', 'Verbal', 'Coding'], default: 'Quant' },
    companyTags: [{ type: String }],
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    isGenerated: { type: Boolean, default: false }
});

export default mongoose.model<IQuestion>('Question', QuestionSchema);
