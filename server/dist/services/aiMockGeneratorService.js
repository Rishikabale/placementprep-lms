"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAIMockTest = exports.generateAIMockTest = void 0;
const Question_1 = __importDefault(require("../models/Question"));
const AIMockTest_1 = __importDefault(require("../models/AIMockTest"));
const StudentPerformanceProfile_1 = __importDefault(require("../models/StudentPerformanceProfile"));
const DIFFICULTY_MAP = {
    'Easy': 1,
    'Medium': 2,
    'Hard': 3
};
const generative_ai_1 = require("@google/generative-ai");
// Initialize Gemini
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const fetchQuestionsFromGemini = (category, difficulty, count) => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.GEMINI_API_KEY)
        return [];
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
        const prompt = `Generate ${count} distinct multiple-choice questions for the category "${category}" with difficulty "${difficulty}". 
        Focus on Placement Aptitude and Technical topics.
        Output ONLY a valid JSON array. Each object must have:
        - text: string (The question)
        - options: array of 4 objects { text: string, isCorrect: boolean }
        - explanation: string (Short explanation)
        Do not include markdown formatting like \`\`\`json. Just the raw JSON.`;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text();
        // Clean up markdown just in case
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(cleanText);
        return questions.map((q) => (Object.assign(Object.assign({}, q), { category,
            difficulty, type: 'MCQ', tags: ['AI Generated', category], isGenerated: true, companyTags: [] })));
    }
    catch (error) {
        console.error(`Gemini Gen Error for ${category}:`, error);
        return [];
    }
});
const generateAIMockTest = (studentId, type, difficulty, duration) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Get or Create Student Profile for Adaptive Logic
    let profile = yield StudentPerformanceProfile_1.default.findOne({ student: studentId });
    if (!profile) {
        profile = yield StudentPerformanceProfile_1.default.create({
            student: studentId,
            adaptiveIndex: { Quant: 30, Logical: 30, Verbal: 30, Coding: 30 }
        });
    }
    // 2. Determine Question Distribution
    let config = [];
    if (type === 'Full Mock') {
        config = [
            { category: 'Quant', count: 5 }, // Reduced for Latency in Demo
            { category: 'Logical', count: 5 },
            { category: 'Verbal', count: 5 },
            { category: 'Coding', count: 2 }
        ];
    }
    else if (type === 'Aptitude Only') {
        config = [
            { category: 'Quant', count: 5 },
            { category: 'Logical', count: 5 },
            { category: 'Verbal', count: 5 }
        ];
    }
    else if (type === 'Coding Only') {
        config = [
            { category: 'Coding', count: 5 }
        ];
    }
    // 3. Select Questions (Hybrid: Gemini First -> DB Fallback)
    const questions = [];
    let maxScore = 0;
    for (const section of config) {
        // Determine target difficulty
        let targetDiff = 'Medium';
        if (difficulty === 'Adaptive') {
            const index = profile.adaptiveIndex[section.category] || 30;
            if (index < 40)
                targetDiff = 'Easy';
            else if (index > 70)
                targetDiff = 'Hard';
        }
        else {
            targetDiff = difficulty;
        }
        // Try Gemini
        let sectionQuestions = yield fetchQuestionsFromGemini(section.category, targetDiff, section.count);
        // If Gemini failed or didn't return enough, use DB
        if (sectionQuestions.length < section.count) {
            console.log(`Gemini fell back to DB for ${section.category}`);
            const dbQuestions = yield Question_1.default.aggregate([
                { $match: { category: section.category, difficulty: targetDiff } },
                { $sample: { size: section.count - sectionQuestions.length } }
            ]);
            // If still not enough, fill with randoms
            if (dbQuestions.length < (section.count - sectionQuestions.length)) {
                const filler = yield Question_1.default.aggregate([
                    { $match: { category: section.category } },
                    { $sample: { size: (section.count - sectionQuestions.length) - dbQuestions.length } }
                ]);
                dbQuestions.push(...filler);
            }
            sectionQuestions = [...sectionQuestions, ...dbQuestions];
        }
        // Ensure we save new AI questions to DB and format all for the test
        for (const q of sectionQuestions) {
            let qId = q._id;
            // If it's a new AI question (no _id), save it
            if (!qId) {
                const newQ = yield Question_1.default.create(q);
                qId = newQ._id;
            }
            questions.push({
                questionId: qId,
                category: section.category, // fallback if mixed
                difficulty: targetDiff,
                // store initial metadata
            });
            maxScore += 1;
        }
    }
    // 4. Create Test Instance
    const mockTest = yield AIMockTest_1.default.create({
        student: studentId,
        type,
        difficulty,
        duration,
        maxScore,
        questions
    });
    return mockTest;
});
exports.generateAIMockTest = generateAIMockTest;
const submitAIMockTest = (testId, answers) => __awaiter(void 0, void 0, void 0, function* () {
    const test = yield AIMockTest_1.default.findById(testId).populate('questions.questionId');
    if (!test)
        throw new Error('Test not found');
    if (test.completedAt)
        throw new Error('Test already submitted');
    let score = 0;
    // Evaluate
    test.questions.forEach((q) => {
        // q.questionId is populated, so we need to access _id
        // Handle case where question might be null (deleted)
        if (!q.questionId)
            return;
        const realQ = q.questionId;
        const studentAns = answers.find(a => a.questionId === realQ._id.toString());
        // For security, strict matching
        if (studentAns) {
            q.selectedOption = studentAns.selectedOption;
            q.timeSpent = studentAns.timeSpent;
            // Check correctness
            // The ID is now the object, we need to cast or access properties
            // But wait, q.questionId is the Ref. 
            // Ideally we should have fetched the Question details separately to check options.
            // But since we populated 'questions.questionId', `q.questionId` IS the document.
            const correctOpt = realQ.options.find((o) => o.isCorrect);
            if (correctOpt && q.selectedOption === correctOpt.text) {
                q.isCorrect = true;
                score += 1;
            }
            else {
                q.isCorrect = false;
            }
        }
        else {
            q.isCorrect = false;
        }
    });
    // Update Test
    test.totalScore = score;
    test.completedAt = new Date();
    // Determine Readiness
    const percentage = (score / test.maxScore) * 100;
    if (percentage >= 80)
        test.readinessLevel = 'High';
    else if (percentage >= 60)
        test.readinessLevel = 'Medium';
    else
        test.readinessLevel = 'Low';
    yield test.save();
    // Update Adaptive Profile
    yield updateStudentProfile(test.student, test);
    return test;
});
exports.submitAIMockTest = submitAIMockTest;
const updateStudentProfile = (studentId, test) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield StudentPerformanceProfile_1.default.findOne({ student: studentId });
    if (!profile)
        return;
    // Simple Adaptive Logic:
    // Calculate accuracy per category
    const catStats = {};
    test.questions.forEach((q) => {
        if (!catStats[q.category])
            catStats[q.category] = { correct: 0, total: 0 };
        catStats[q.category].total++;
        if (q.isCorrect)
            catStats[q.category].correct++;
    });
    // Adjust Index
    // If accuracy > 70% -> +5
    // If accuracy < 40% -> -5
    // Clamp 0-100
    Object.keys(catStats).forEach((cat) => {
        const acc = (catStats[cat].correct / catStats[cat].total) * 100;
        let change = 0;
        if (acc > 75)
            change = 5;
        else if (acc < 40)
            change = -5;
        // Apply change
        let current = profile.adaptiveIndex[cat] || 30;
        current += change;
        if (current > 100)
            current = 100;
        if (current < 0)
            current = 0;
        profile.adaptiveIndex[cat] = current;
    });
    profile.history.push({
        testId: test._id,
        score: test.totalScore,
        date: new Date()
    });
    yield profile.save();
});
