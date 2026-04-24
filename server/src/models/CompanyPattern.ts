import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyPattern extends Document {
    name: string; // e.g. "TCS NQT"
    description?: string;
    totalDuration: number; // in minutes
    negativeMarking: boolean; // e.g. true (0.25 deducted?) - simplified as boolean for logic
    negativeMarkValue: number; // e.g. 0.25 (optional, default 0)
    sections: {
        sectionName: string; // e.g. "Quantitative Aptitude"
        questionCount: number; // e.g. 20
        category: 'Quant' | 'Logical' | 'Verbal' | 'Coding'; // Links to Question.category
        weightage: number; // Marks per question, e.g. 1 or 2
        difficulty?: 'Easy' | 'Medium' | 'Hard'; // Optional preference
    }[];
    createdBy?: mongoose.Types.ObjectId;
    isPublic: boolean;
    isGlobal: boolean;
    createdAt: Date;
}

const CompanyPatternSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    totalDuration: { type: Number, required: true },
    negativeMarking: { type: Boolean, default: false },
    negativeMarkValue: { type: Number, default: 0 },
    sections: [{
        sectionName: { type: String, required: true },
        questionCount: { type: Number, required: true },
        category: { type: String, enum: ['Quant', 'Logical', 'Verbal', 'Coding'], required: true },
        weightage: { type: Number, default: 1 },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] }
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: false },
    isGlobal: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<ICompanyPattern>('CompanyPattern', CompanyPatternSchema);
