import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
    user: mongoose.Schema.Types.ObjectId;
    recommendedCourses: mongoose.Schema.Types.ObjectId[];
    focusAreas: string[]; // e.g. "Algebra", "Dynamic Programming"
    suggestedPracticeTests: mongoose.Schema.Types.ObjectId[];
    reason: string;
    createdAt: Date;
}

const RecommendationSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recommendedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    focusAreas: [{ type: String }],
    suggestedPracticeTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    reason: { type: String }
}, { timestamps: true });

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
