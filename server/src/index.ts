import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import path from 'path';

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-lms';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import quizRoutes from './routes/quizRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import companyPatternRoutes from './routes/companyPatternRoutes';
import mockTestRoutes from './routes/mockTestRoutes';
import careerRoutes from './routes/careerRoutes';
import aiMockRoutes from './routes/aiMockRoutes';
import questionRoutes from './routes/questionRoutes';
import companyTestRoutes from './routes/companyTestRoutes';
import resumeRoutes from './routes/resumeRoutes';
import adminRoutes from './routes/adminRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/company-patterns', companyPatternRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/ai-mock', aiMockRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/company-test', companyTestRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Placement LMS API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
