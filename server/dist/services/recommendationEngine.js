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
exports.generateRecommendations = void 0;
const Progress_1 = __importDefault(require("../models/Progress"));
const Recommendation_1 = __importDefault(require("../models/Recommendation"));
const Course_1 = __importDefault(require("../models/Course"));
const Quiz_1 = __importDefault(require("../models/Quiz"));
const generateRecommendations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const progress = yield Progress_1.default.findOne({ student: userId });
    if (!progress)
        return null;
    let focusAreas = [];
    let reason = "Based on your recent performance";
    // 1. Analyze Aptitude Scores
    // If average aptitude score is low (< 60), recommend Aptitude courses
    let aptScoreSum = 0;
    progress.aptitudeScores.forEach(s => aptScoreSum += s.score);
    const avgAptScore = progress.aptitudeScores.length > 0 ? aptScoreSum / progress.aptitudeScores.length : 100;
    if (avgAptScore < 60) {
        focusAreas.push("Aptitude");
        reason += ", we noticed you struggled with Aptitude tests.";
    }
    // 2. Analyze Coding Scores
    let codingScoreSum = 0;
    progress.codingTestScores.forEach(s => codingScoreSum += s.score);
    const avgCodingScore = progress.codingTestScores.length > 0 ? codingScoreSum / progress.codingTestScores.length : 100;
    if (avgCodingScore < 60) {
        focusAreas.push("Coding");
        reason += " and Coding challenges.";
    }
    // 3. Find Courses matching focus areas
    const recommendedCourses = yield Course_1.default.find({ tags: { $in: focusAreas } }).limit(3);
    // 4. Find Practice Tests
    const practiceTests = yield Quiz_1.default.find({ type: 'APTITUDE_TEST' }).limit(2);
    // Save Recommendation
    const recommendation = yield Recommendation_1.default.findOneAndUpdate({ user: userId }, {
        user: userId,
        recommendedCourses: recommendedCourses.map(c => c._id),
        focusAreas,
        suggestedPracticeTests: practiceTests.map(t => t._id),
        reason
    }, { upsert: true, new: true });
    return recommendation;
});
exports.generateRecommendations = generateRecommendations;
