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
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
function test() {
    return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield model.generateContent(prompt);
            const response = yield result.response;
            const text = response.text();
            console.log("Raw Response:");
            console.log(text);
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log("Clean text:");
            console.log(cleanText);
            const patternData = JSON.parse(cleanText);
            console.log("Parsed Data:", patternData);
        }
        catch (e) {
            console.error("Error:", e);
        }
    });
}
test();
