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
exports.seedGlobalPatterns = exports.cloneCompanyPattern = exports.deleteCompanyPattern = exports.getCompanyPatternById = exports.getCompanyPatterns = exports.createCompanyPattern = void 0;
const CompanyPattern_1 = __importDefault(require("../models/CompanyPattern"));
// @desc    Create a new company pattern
// @route   POST /api/company-patterns
// @access  Private (Instructor/Admin)
const createCompanyPattern = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, totalDuration, negativeMarking, negativeMarkValue, sections, isPublic, isGlobal } = req.body;
        const user = req.user;
        const pattern = new CompanyPattern_1.default({
            name,
            description,
            totalDuration,
            negativeMarking,
            negativeMarkValue,
            sections,
            createdBy: user._id,
            isPublic: isPublic || false,
            isGlobal: user.role === 'admin' ? (isGlobal || false) : false
        });
        const createdPattern = yield pattern.save();
        res.status(201).json(createdPattern);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.createCompanyPattern = createCompanyPattern;
// @desc    Get all company patterns
// @route   GET /api/company-patterns
// @access  Private
const getCompanyPatterns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const user = req.user;
        let query = {};
        if (filter === 'mine') {
            query.createdBy = user._id;
        }
        else if (filter === 'community') {
            query.isPublic = true;
            query.isGlobal = false;
        }
        else if (filter === 'global') {
            query.isGlobal = true;
        }
        else {
            query = {
                $or: [
                    { createdBy: user._id },
                    { isPublic: true },
                    { isGlobal: true }
                ]
            };
        }
        const patterns = yield CompanyPattern_1.default.find(query).populate('createdBy', 'name email');
        res.json(patterns);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getCompanyPatterns = getCompanyPatterns;
// @desc    Get single company pattern
// @route   GET /api/company-patterns/:id
// @access  Private
const getCompanyPatternById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pattern = yield CompanyPattern_1.default.findById(req.params.id);
        if (pattern) {
            res.json(pattern);
        }
        else {
            res.status(404).json({ message: 'Pattern not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getCompanyPatternById = getCompanyPatternById;
// @desc    Delete company pattern
// @route   DELETE /api/company-patterns/:id
// @access  Private (Instructor/Admin)
const deleteCompanyPattern = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const pattern = yield CompanyPattern_1.default.findById(req.params.id);
        const user = req.user;
        if (pattern) {
            if (pattern.isGlobal && user.role !== 'admin') {
                res.status(403).json({ message: 'Not authorized to delete global patterns' });
                return;
            }
            if (((_a = pattern.createdBy) === null || _a === void 0 ? void 0 : _a.toString()) !== user._id.toString() && user.role !== 'admin') {
                res.status(403).json({ message: 'Not authorized to delete this pattern' });
                return;
            }
            yield pattern.deleteOne();
            res.json({ message: 'Pattern removed' });
        }
        else {
            res.status(404).json({ message: 'Pattern not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.deleteCompanyPattern = deleteCompanyPattern;
// @desc    Clone an existing company pattern
// @route   POST /api/company-patterns/:id/clone
// @access  Private (Instructor/Admin)
const cloneCompanyPattern = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const originalPattern = yield CompanyPattern_1.default.findById(req.params.id);
        if (!originalPattern) {
            res.status(404).json({ message: 'Pattern not found' });
            return;
        }
        const user = req.user;
        const clonedPattern = new CompanyPattern_1.default({
            name: `${originalPattern.name} (Clone)`,
            description: originalPattern.description,
            totalDuration: originalPattern.totalDuration,
            negativeMarking: originalPattern.negativeMarking,
            negativeMarkValue: originalPattern.negativeMarkValue,
            sections: originalPattern.sections,
            createdBy: user._id,
            isPublic: false,
            isGlobal: false
        });
        const savedClone = yield clonedPattern.save();
        res.status(201).json(savedClone);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.cloneCompanyPattern = cloneCompanyPattern;
// @desc    Seed global company patterns
// @route   POST /api/company-patterns/seed
// @access  Private (Admin)
const seedGlobalPatterns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const topCompanies = [
            {
                name: "TCS Standard Pattern",
                description: "Standard exam pattern for TCS NQT.",
                totalDuration: 90,
                negativeMarking: false,
                negativeMarkValue: 0,
                sections: [
                    { sectionName: "Numerical Ability", questionCount: 20, category: "Quant", weightage: 1, difficulty: "Medium" },
                    { sectionName: "Verbal Ability", questionCount: 24, category: "Verbal", weightage: 1, difficulty: "Easy" },
                    { sectionName: "Reasoning Ability", questionCount: 30, category: "Logical", weightage: 1, difficulty: "Medium" }
                ],
                isPublic: true,
                isGlobal: true
            },
            {
                name: "Infosys Standard Pattern",
                description: "Standard exam pattern for Infosys.",
                totalDuration: 100,
                negativeMarking: false,
                negativeMarkValue: 0,
                sections: [
                    { sectionName: "Mathematical Ability", questionCount: 10, category: "Quant", weightage: 1, difficulty: "Hard" },
                    { sectionName: "Verbal Ability", questionCount: 20, category: "Verbal", weightage: 1, difficulty: "Medium" },
                    { sectionName: "Logical Reasoning", questionCount: 15, category: "Logical", weightage: 1, difficulty: "Medium" }
                ],
                isPublic: true,
                isGlobal: true
            }
        ];
        for (const company of topCompanies) {
            const exists = yield CompanyPattern_1.default.findOne({ name: company.name });
            if (!exists) {
                yield CompanyPattern_1.default.create(Object.assign(Object.assign({}, company), { createdBy: user._id }));
            }
        }
        res.status(201).json({ message: 'Global patterns seeded successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.seedGlobalPatterns = seedGlobalPatterns;
