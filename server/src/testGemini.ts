import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function test() {
    const companyName = "TCS NQT";
    const prompt = `Generate a standard placement exam pattern for the company "${companyName}".
        Output ONLY a valid JSON object matching this schema exactly. Do not include markdown formatting or comments.
        {
            "name": "${companyName} Standard Pattern",
            "description": "Standard exam pattern for ${companyName}",
            "totalDuration": <number_in_minutes_total>,
            "negativeMarking": <boolean>,
            "negativeMarkValue": <number_e_g_0_25_or_0>,
            "sections": [
                {
                    "sectionName": "<e.g., Quantitative Aptitude>",
                    "questionCount": <number>,
                    "category": "<Must be exactly one of: 'Quant', 'Logical', 'Verbal', 'Coding'>",
                    "weightage": <number_usually_1>,
                    "difficulty": "<Must be exactly one of: 'Easy', 'Medium', 'Hard'>"
                }
            ]
        }
        Make sure the sections array contains typical sections for this company. Match 'category' precisely to 'Quant', 'Logical', 'Verbal', or 'Coding'.`;

    try {
        console.log("Sending prompt...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Raw Response:");
        console.log(text);

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log("Clean text:");
        console.log(cleanText);

        const patternData = JSON.parse(cleanText);
        console.log("Parsed Data:", patternData);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
