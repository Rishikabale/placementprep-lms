import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
    title: string;
    description?: string;
    url: string; // URL to video file
    duration: number; // in seconds
    courseId: mongoose.Schema.Types.ObjectId;
    quizId?: mongoose.Schema.Types.ObjectId; // Optional link to a quiz
    createdAt: Date;
}

const VideoSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    duration: { type: Number, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
}, { timestamps: true });

export default mongoose.model<IVideo>('Video', VideoSchema);
