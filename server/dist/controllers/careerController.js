"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.createCareerRole = exports.getCareerRoles = exports.recalculateRecommendations = exports.getRecommendations = void 0;
const CareerEngine = __importStar(require("../services/careerRecommendationEngine"));
const CareerRecommendation_1 = __importDefault(require("../models/CareerRecommendation"));
const CareerRole_1 = __importDefault(require("../models/CareerRole"));
const getRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = req.user.id;
        // Check for existing recent recommendation
        const recent = yield CareerRecommendation_1.default.findOne({ student: studentId }).sort({ generatedAt: -1 });
        // If recent (< 24 hours), return it
        // ... simplistic check for now, let's just return it if it exists
        if (recent) {
            return res.json(recent);
        }
        // Else generate new
        const newRec = yield CareerEngine.generateCareerRecommendation(studentId);
        res.json(newRec);
    }
    catch (error) {
        console.error(error);
        if (error.message.includes('No mock test data')) {
            return res.status(400).json({ message: 'Please take at least one mock test to generate career insights.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getRecommendations = getRecommendations;
const recalculateRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = req.user.id;
        const newRec = yield CareerEngine.generateCareerRecommendation(studentId);
        res.json(newRec);
    }
    catch (error) {
        console.error(error);
        if (error.message.includes('No mock test data')) {
            return res.status(400).json({ message: 'Please take at least one mock test to generate career insights.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.recalculateRecommendations = recalculateRecommendations;
const getCareerRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield CareerRole_1.default.find();
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getCareerRoles = getCareerRoles;
const createCareerRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield CareerRole_1.default.create(req.body);
        res.status(201).json(role);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.createCareerRole = createCareerRole;
