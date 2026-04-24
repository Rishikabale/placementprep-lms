import mongoose from 'mongoose';
import Question from '../models/Question';
import AIMockTest, { IAIMockTest } from '../models/AIMockTest';
import StudentPerformanceProfile from '../models/StudentPerformanceProfile';

const DIFFICULTY_MAP: any = {
    'Easy': 1,
    'Medium': 2,
    'Hard': 3
};

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const fetchQuestionsFromGemini = async (category: string, difficulty: string, count: number): Promise<any[]> => {
    if (!process.env.GEMINI_API_KEY) return [];

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

        const prompt = `Generate ${count} distinct multiple-choice questions for the category "${category}" with difficulty "${difficulty}". 
        Focus on Placement Aptitude and Technical topics.
        Output ONLY a valid JSON array. Each object must have:
        - text: string (The question)
        - options: array of 4 objects { text: string, isCorrect: boolean }
        - explanation: string (Short explanation)
        Do not include markdown formatting like \`\`\`json. Just the raw JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown just in case
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(cleanText);

        return questions.map((q: any) => ({
            ...q,
            category,
            difficulty,
            type: 'MCQ',
            tags: ['AI Generated', category],
            isGenerated: true,
            companyTags: []
        }));

    } catch (error) {
        console.error(`Gemini Gen Error for ${category}:`, error);
        return [];
    }
};

export const generateAIMockTest = async (
    studentId: string,
    type: string,
    difficulty: string,
    duration: number
) => {
    // 1. Get or Create Student Profile for Adaptive Logic
    let profile = await StudentPerformanceProfile.findOne({ student: studentId as any });
    if (!profile) {
        profile = await StudentPerformanceProfile.create({
            student: studentId as any,
            adaptiveIndex: { Quant: 30, Logical: 30, Verbal: 30, Coding: 30 }
        });
    }

    // 2. Determine Question Distribution
    let config: any = [];
    if (type === 'Full Mock') {
        config = [
            { category: 'Quant', count: 5 }, // Reduced for Latency in Demo
            { category: 'Logical', count: 5 },
            { category: 'Verbal', count: 5 },
            { category: 'Coding', count: 2 }
        ];
    } else if (type === 'Aptitude Only') {
        config = [
            { category: 'Quant', count: 5 },
            { category: 'Logical', count: 5 },
            { category: 'Verbal', count: 5 }
        ];
    } else if (type === 'Coding Only') {
        config = [
            { category: 'Coding', count: 5 }
        ];
    }

    // 3. Select Questions (Hybrid: Gemini First -> DB Fallback)
    const questions: any[] = [];
    let maxScore = 0;

    for (const section of config) {
        // Determine target difficulty
        let targetDiff = 'Medium';
        if (difficulty === 'Adaptive') {
            const index: number = (profile.adaptiveIndex as any)[section.category] || 30;
            if (index < 40) targetDiff = 'Easy';
            else if (index > 70) targetDiff = 'Hard';
        } else {
            targetDiff = difficulty;
        }

        // Try Gemini
        let sectionQuestions = await fetchQuestionsFromGemini(section.category, targetDiff, section.count);

        // If Gemini failed or didn't return enough, use DB
        if (sectionQuestions.length < section.count) {
            console.log(`Gemini fell back to DB for ${section.category}`);
            const dbQuestions = await Question.aggregate([
                { $match: { category: section.category, difficulty: targetDiff } },
                { $sample: { size: section.count - sectionQuestions.length } }
            ]);
            // If still not enough, fill with randoms
            if (dbQuestions.length < (section.count - sectionQuestions.length)) {
                const filler = await Question.aggregate([
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
                const newQ = await Question.create(q);
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
    const mockTest = await AIMockTest.create({
        student: studentId as any,
        type,
        difficulty,
        duration,
        maxScore,
        questions
    });

    return mockTest;
};

export const submitAIMockTest = async (testId: string, answers: any[]) => {
    const test = await AIMockTest.findById(testId).populate('questions.questionId');
    if (!test) throw new Error('Test not found');

    if (test.completedAt) throw new Error('Test already submitted');

    let score = 0;

    // Evaluate
    test.questions.forEach((q: any) => {
        // q.questionId is populated, so we need to access _id
        // Handle case where question might be null (deleted)
        if (!q.questionId) return;

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

            const correctOpt = realQ.options.find((o: any) => o.isCorrect);
            if (correctOpt && q.selectedOption === correctOpt.text) {
                q.isCorrect = true;
                score += 1;
            } else {
                q.isCorrect = false;
            }
        } else {
            q.isCorrect = false;
        }
    });

    // Update Test
    test.totalScore = score;
    test.completedAt = new Date();

    // Determine Readiness
    const percentage = (score / test.maxScore) * 100;
    if (percentage >= 80) test.readinessLevel = 'High';
    else if (percentage >= 60) test.readinessLevel = 'Medium';
    else test.readinessLevel = 'Low';

    await test.save();

    // Update Adaptive Profile
    await updateStudentProfile(test.student as any, test);

    return test;
};

const updateStudentProfile = async (studentId: string, test: IAIMockTest) => {
    const profile = await StudentPerformanceProfile.findOne({ student: studentId as any });
    if (!profile) return;

    // Simple Adaptive Logic:
    // Calculate accuracy per category
    const catStats: any = {};

    test.questions.forEach((q: any) => {
        if (!catStats[q.category]) catStats[q.category] = { correct: 0, total: 0 };
        catStats[q.category].total++;
        if (q.isCorrect) catStats[q.category].correct++;
    });

    // Adjust Index
    // If accuracy > 70% -> +5
    // If accuracy < 40% -> -5
    // Clamp 0-100

    Object.keys(catStats).forEach((cat) => {
        const acc = (catStats[cat].correct / catStats[cat].total) * 100;
        let change = 0;
        if (acc > 75) change = 5;
        else if (acc < 40) change = -5;

        // Apply change
        let current = (profile.adaptiveIndex as any)[cat] || 30;
        current += change;
        if (current > 100) current = 100;
        if (current < 0) current = 0;

        (profile.adaptiveIndex as any)[cat] = current;
    });

    profile.history.push({
        testId: test._id as any,
        score: test.totalScore,
        date: new Date()
    });

    await profile.save();
};
