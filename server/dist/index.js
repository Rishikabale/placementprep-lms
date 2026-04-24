"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const path_1 = __importDefault(require("path"));
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, morgan_1.default)('dev'));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-lms';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const companyPatternRoutes_1 = __importDefault(require("./routes/companyPatternRoutes"));
const mockTestRoutes_1 = __importDefault(require("./routes/mockTestRoutes"));
const careerRoutes_1 = __importDefault(require("./routes/careerRoutes"));
const aiMockRoutes_1 = __importDefault(require("./routes/aiMockRoutes"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const companyTestRoutes_1 = __importDefault(require("./routes/companyTestRoutes"));
const resumeRoutes_1 = __importDefault(require("./routes/resumeRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/quizzes', quizRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/company-patterns', companyPatternRoutes_1.default);
app.use('/api/mock-tests', mockTestRoutes_1.default);
app.use('/api/career', careerRoutes_1.default);
app.use('/api/ai-mock', aiMockRoutes_1.default);
app.use('/api/questions', questionRoutes_1.default);
app.use('/api/company-test', companyTestRoutes_1.default);
app.use('/api/resume', resumeRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Placement LMS API is running');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
