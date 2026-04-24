import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    description: string;
    instructor: mongoose.Schema.Types.ObjectId;
    thumbnail?: string; // URL to image
    tags: string[]; // e.g. "React", "Aptitude", "Quant"
    modules: {
        title: string;
        videos: mongoose.Schema.Types.ObjectId[]; // Reference to Video model
    }[];
    isPublished: boolean;
    createdAt: Date;
}

const CourseSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: { type: String },
    tags: [{ type: String }],
    modules: [{
        title: { type: String, required: true },
        videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
    }],
    isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
