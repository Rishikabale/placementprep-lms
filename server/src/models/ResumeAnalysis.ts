import mongoose, { Document, Schema, Types } from 'mongoose';

interface ISectionScore {
    sectionName: string;
    score: number;
    maxScore: number;
    feedback: string;
}

interface ICareerFit {
    roleId: Types.ObjectId;
    roleName: string;
    matchPercentage: number;
}

export interface IResumeAnalysis extends Document {
    studentId: Types.ObjectId;
    resumeText: string;
    originalFileName?: string;
    totalScore: number;         // Out of 100
    sectionScores: ISectionScore[];
    strengths: string[];        // Positive highlights
    weaknesses: string[];       // Missing sections or bad formatting
    suggestions: string[];      // Actionable improvements
    extractedSkills: string[];  // Found keywords (Java, Python, React, etc.)
    careerFit: ICareerFit[];    // Alignment with standard Career Roles
    createdAt: Date;
}

const SectionScoreSchema = new Schema({
    sectionName: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    feedback: { type: String, required: true }
}, { _id: false });

const CareerFitSchema = new Schema({
    roleId: { type: Schema.Types.ObjectId, ref: 'CareerRole', required: true },
    roleName: { type: String, required: true },
    matchPercentage: { type: Number, required: true }
}, { _id: false });

const ResumeAnalysisSchema = new Schema<IResumeAnalysis>({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeText: { type: String, required: true },
    originalFileName: { type: String },
    totalScore: { type: Number, required: true },
    sectionScores: [SectionScoreSchema],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
    extractedSkills: [{ type: String }],
    careerFit: [CareerFitSchema],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IResumeAnalysis>('ResumeAnalysis', ResumeAnalysisSchema);
