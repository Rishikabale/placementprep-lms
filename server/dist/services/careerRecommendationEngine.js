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
exports.generateCareerRecommendation = void 0;
const MockTestResult_1 = __importDefault(require("../models/MockTestResult"));
const AIMockTest_1 = __importDefault(require("../models/AIMockTest"));
const CareerRole_1 = __importDefault(require("../models/CareerRole"));
const CareerRecommendation_1 = __importDefault(require("../models/CareerRecommendation"));
const generative_ai_1 = require("@google/generative-ai");
const generateCareerRecommendation = (studentId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Aggregate Student Metrics from Mock Tests
    const mockResults = yield MockTestResult_1.default.find({ student: studentId }).populate('pattern');
    const aiMockResults = yield AIMockTest_1.default.find({ student: studentId, completedAt: { $ne: null } }).populate('questions.questionId');
    if (mockResults.length === 0 && aiMockResults.length === 0) {
        throw new Error('No mock test data available to generate recommendations.');
    }
    let totalQuant = 0, countQuant = 0;
    let totalLogical = 0, countLogical = 0;
    let totalVerbal = 0, countVerbal = 0;
    let totalCoding = 0, countCoding = 0;
    // A. Process Standard Mock Tests
    for (const result of mockResults) {
        const pattern = result.pattern;
        if (!pattern)
            continue;
        // Map section names to categories
        const categoryMap = {};
        pattern.sections.forEach((sec) => {
            categoryMap[sec.sectionName] = sec.category;
        });
        result.sectionResults.forEach((sec) => {
            const cat = categoryMap[sec.sectionName];
            const patternSec = pattern.sections.find((s) => s.sectionName === sec.sectionName);
            const sectionMax = patternSec ? patternSec.questionCount * patternSec.weightage : 10;
            const percentage = (sec.score / sectionMax) * 100;
            if (cat === 'Quant') {
                totalQuant += percentage;
                countQuant++;
            }
            if (cat === 'Logical') {
                totalLogical += percentage;
                countLogical++;
            }
            if (cat === 'Verbal') {
                totalVerbal += percentage;
                countVerbal++;
            }
            if (cat === 'Coding') {
                totalCoding += percentage;
                countCoding++;
            }
        });
    }
    // B. Process AI Mock Tests
    // AIMockTest has a flat list of questions with categories
    for (const test of aiMockResults) {
        // We need to calculate accuracy per category for this test
        const catStats = {}; // { Quant: { correct: 0, total: 0 } }
        test.questions.forEach((q) => {
            const cat = q.category || 'Quant'; // Fallback
            if (!catStats[cat])
                catStats[cat] = { correct: 0, total: 0 };
            catStats[cat].total++;
            if (q.isCorrect)
                catStats[cat].correct++;
        });
        // Add to global totals
        Object.keys(catStats).forEach(cat => {
            const acc = (catStats[cat].correct / catStats[cat].total) * 100;
            if (cat === 'Quant') {
                totalQuant += acc;
                countQuant++;
            }
            if (cat === 'Logical') {
                totalLogical += acc;
                countLogical++;
            }
            if (cat === 'Verbal') {
                totalVerbal += acc;
                countVerbal++;
            }
            if (cat === 'Coding') {
                totalCoding += acc;
                countCoding++;
            }
        });
    }
    const avgQuant = countQuant ? totalQuant / countQuant : 0;
    const avgLogical = countLogical ? totalLogical / countLogical : 0;
    const avgVerbal = countVerbal ? totalVerbal / countVerbal : 0;
    const avgCoding = countCoding ? totalCoding / countCoding : 0;
    const studentMetrics = {
        averageQuant: Math.round(avgQuant),
        averageLogical: Math.round(avgLogical),
        averageVerbal: Math.round(avgVerbal),
        averageCoding: Math.round(avgCoding),
        consistencyScore: 80, // value placeholder
        overallReadiness: 'Moderately Ready' // simple derived
    };
    // 2. Fetch Career Roles
    const roles = yield CareerRole_1.default.find({});
    if (roles.length === 0) {
        // Seed default roles if none exist
        const defaultRoles = [
            { roleName: 'Software Engineer', requiredSkills: [{ skill: 'Coding', threshold: 70, weightage: 5 }, { skill: 'Logical', threshold: 60, weightage: 3 }] },
            { roleName: 'Data Analyst', requiredSkills: [{ skill: 'Quant', threshold: 70, weightage: 5 }, { skill: 'Logical', threshold: 60, weightage: 4 }] },
            { roleName: 'Product Manager', requiredSkills: [{ skill: 'Verbal', threshold: 70, weightage: 5 }, { skill: 'Logical', threshold: 60, weightage: 4 }] }
        ];
        yield CareerRole_1.default.insertMany(defaultRoles);
        // Re-fetch
        roles.push(...(yield CareerRole_1.default.find({})));
    }
    // 3. Use Gemini AI for Recommendations
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let recommendations = [];
    try {
        const prompt = `
        You are an expert Career Counselor for engineering students.
        
        **Student Profile:**
        - Quantitative: ${studentMetrics.averageQuant}%
        - Logical Reasoning: ${studentMetrics.averageLogical}%
        - Verbal Ability: ${studentMetrics.averageVerbal}%
        - Coding/Technical: ${studentMetrics.averageCoding}%
        
        **Available Career Roles & Requirements:**
        ${JSON.stringify(roles.map(r => ({
            name: r.roleName,
            requirements: r.requiredSkills.map(s => `${s.skill}: ${s.threshold}% (Weight: ${s.weightage})`).join(', ')
        })))}

        **Task:**
        Analyze the student's profile against the available roles. 
        Select the TOP 3 most suitable roles.
        
        **Output Format:**
        Provide a Strictly valid JSON array of objects. No markdown. No explanations outside the JSON.
        Structure:
        [
            {
                "roleName": "Exact Name from list",
                "matchPercentage": Number (0-100),
                "reason": "A personalized 1-sentence explanation of why they fit or what is missing.",
                "missingSkills": [ 
                    { "skill": "Skill Name", "gap": Number (Difference) } 
                ]
            }
        ]
        `;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const aiRecs = JSON.parse(text);
        // Map AI results back to DB IDs
        recommendations = aiRecs.map((aiRec) => {
            const roleDoc = roles.find(r => r.roleName === aiRec.roleName);
            if (!roleDoc)
                return null;
            // Re-format missing skills to match Schema if needed, or trust AI
            // Schema expects: { skill, current, required, gap }
            // AI gave us 'gap'. We can infer current/required from context or just store what we have if schema allows.
            // Actually, the Schema defines strict structure. Let's hydrate it.
            const filledMissingSkills = (aiRec.missingSkills || []).map((ms) => {
                const reqSkill = roleDoc.requiredSkills.find(s => s.skill === ms.skill);
                const reqVal = reqSkill ? reqSkill.threshold : 0;
                // infer current from profile
                let currentVal = 0;
                if (ms.skill === 'Quant')
                    currentVal = studentMetrics.averageQuant;
                if (ms.skill === 'Logical')
                    currentVal = studentMetrics.averageLogical;
                if (ms.skill === 'Verbal')
                    currentVal = studentMetrics.averageVerbal;
                if (ms.skill === 'Coding')
                    currentVal = studentMetrics.averageCoding;
                return {
                    skill: ms.skill,
                    current: currentVal,
                    required: reqVal,
                    gap: ms.gap
                };
            });
            return {
                role: roleDoc._id,
                roleName: roleDoc.roleName,
                matchPercentage: aiRec.matchPercentage,
                reason: aiRec.reason,
                missingSkills: filledMissingSkills
            };
        }).filter((r) => r !== null);
    }
    catch (error) {
        console.error("Gemini Career Rec Error:", error);
        // Fallback: Simple Rule-Based Recommendation
        // If AI fails, we still want to give the user something.
        const highestSkill = Object.keys(studentMetrics).reduce((a, b) => studentMetrics[a] > studentMetrics[b] ? a : b);
        let fallbackRole = 'Data Analyst';
        if (studentMetrics.averageCoding > 60)
            fallbackRole = 'Software Development Engineer';
        else if (studentMetrics.averageQuant > 60)
            fallbackRole = 'Financial Analyst';
        else if (studentMetrics.averageVerbal > 60)
            fallbackRole = 'Product Manager';
        recommendations = [{
                roleName: fallbackRole,
                matchPercentage: 75,
                reason: "Based on your strong performance in " + highestSkill.replace('average', ''),
                missingSkills: []
            }];
    }
    // 4. Save to DB
    const recEntry = yield CareerRecommendation_1.default.create({
        student: studentId,
        metrics: studentMetrics,
        recommendations: recommendations
    });
    return recEntry;
});
exports.generateCareerRecommendation = generateCareerRecommendation;
