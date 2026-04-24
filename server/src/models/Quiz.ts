import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
    title: string;
    description?: string;
    questions: mongoose.Schema.Types.ObjectId[];
    duration: number; // in minutes
    passingScore: number; // percentage
    type: 'VIDEO_QUIZ' | 'APTITUDE_TEST' | 'CODING_TEST';
    relatedVideo?: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

const QuizSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    duration: { type: Number, default: 10 },
    passingScore: { type: Number, default: 60 },
    type: { type: String, enum: ['VIDEO_QUIZ', 'APTITUDE_TEST', 'CODING_TEST'], required: true },
    relatedVideo: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' }
}, { timestamps: true });

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
