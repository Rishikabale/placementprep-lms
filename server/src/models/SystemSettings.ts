import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
    mockTestDurationLimit: number; // e.g. 120 minutes
    globalNegativeMarkingRule: boolean;
    aptitudeScoreWeight: number; // e.g. 0.4
    codingScoreWeight: number; // e.g. 0.6
    readinessThreshold: number; // score to be considered 'ready' e.g. 70
}

const SystemSettingsSchema = new Schema({
    mockTestDurationLimit: { type: Number, default: 120 },
    globalNegativeMarkingRule: { type: Boolean, default: false },
    aptitudeScoreWeight: { type: Number, default: 0.4 },
    codingScoreWeight: { type: Number, default: 0.6 },
    readinessThreshold: { type: Number, default: 70 },
}, { timestamps: true });

export default mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
