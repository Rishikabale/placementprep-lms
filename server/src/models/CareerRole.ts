import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerRole extends Document {
    roleName: string; // e.g. "Backend Developer"
    description: string;
    requiredSkills: {
        skill: 'Quant' | 'Logical' | 'Verbal' | 'Coding';
        threshold: number; // 0-100 percentage required
        weightage: number; // Importance (1-3)
    }[];
    recommendedThresholds: {
        minPercentile: number; // e.g. 70
        minReadiness: string; // 'Moderately Ready'
    };
    growthPath: string[]; // e.g. ["Junior dev", "Senior Dev", "Architect"]
    averagePackageRange: string; // "6-12 LPA"
    improvementResources: string[]; // Links to courses/modules
    createdAt: Date;
}

const CareerRoleSchema: Schema = new Schema({
    roleName: { type: String, required: true, unique: true },
    description: { type: String },
    requiredSkills: [{
        skill: { type: String, enum: ['Quant', 'Logical', 'Verbal', 'Coding'], required: true },
        threshold: { type: Number, required: true },
        weightage: { type: Number, default: 1 }
    }],
    recommendedThresholds: {
        minPercentile: { type: Number, default: 0 },
        minReadiness: { type: String, default: 'Needs Improvement' }
    },
    growthPath: [{ type: String }],
    averagePackageRange: { type: String },
    improvementResources: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICareerRole>('CareerRole', CareerRoleSchema);
