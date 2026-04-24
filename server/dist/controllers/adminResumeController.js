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
exports.getAdminResumeTrends = void 0;
const ResumeAnalysis_1 = __importDefault(require("../models/ResumeAnalysis"));
// @desc    View Resume Analyzer Trends
// @route   GET /api/admin/resumes
// @access  Private/Admin
const getAdminResumeTrends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Average scores across distinct sections
        const avgSectionScores = yield ResumeAnalysis_1.default.aggregate([
            { $unwind: "$sectionScores" },
            { $group: { _id: "$sectionScores.sectionName", avgScore: { $avg: "$sectionScores.score" } } }
        ]);
        // Most common weaknesses (simple flattening and grouping)
        const commonWeaknesses = yield ResumeAnalysis_1.default.aggregate([
            { $unwind: "$weaknesses" },
            { $group: { _id: "$weaknesses", frequency: { $sum: 1 } } },
            { $sort: { frequency: -1 } },
            { $limit: 10 }
        ]);
        // Most common tracked technical skills
        const topSkills = yield ResumeAnalysis_1.default.aggregate([
            { $unwind: "$extractedSkills" },
            { $group: { _id: "$extractedSkills", frequency: { $sum: 1 } } },
            { $sort: { frequency: -1 } },
            { $limit: 15 }
        ]);
        res.json({ avgSectionScores, commonWeaknesses, topSkills });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error retrieving resume trends' });
    }
});
exports.getAdminResumeTrends = getAdminResumeTrends;
