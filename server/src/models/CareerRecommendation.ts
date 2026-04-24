import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerRecommendation extends Document {
    student: mongoose.Schema.Types.ObjectId;
    generatedAt: Date;
    metrics: {
        averageCoding: number;
        averageQuant: number;
        averageLogical: number;
        averageVerbal: number;
        consistencyScore: number;
        overallReadiness: string;
    };
    recommendations: {
        role: mongoose.Schema.Types.ObjectId; // Link to CareerRole
        roleName: string;
        matchPercentage: number;
        reason: string; // "Your high coding score (85%) makes you a great fit..."
        missingSkills: {
            skill: string;
            current: number;
            required: number;
            gap: number;
        }[];
    }[];
}

const CareerRecommendationSchema: Schema = new Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    generatedAt: { type: Date, default: Date.now },
    metrics: {
        averageCoding: { type: Number, default: 0 },
        averageQuant: { type: Number, default: 0 },
        averageLogical: { type: Number, default: 0 },
        averageVerbal: { type: Number, default: 0 },
        consistencyScore: { type: Number, default: 0 },
        overallReadiness: { type: String }
    },
    recommendations: [{
        role: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole' },
        roleName: { type: String },
        matchPercentage: { type: Number },
        reason: { type: String },
        missingSkills: [{
            skill: { type: String },
            current: { type: Number },
            required: { type: Number },
            gap: { type: Number }
        }]
    }]
});

export default mongoose.model<ICareerRecommendation>('CareerRecommendation', CareerRecommendationSchema);
