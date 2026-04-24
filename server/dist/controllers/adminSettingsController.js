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
exports.updateSystemSettings = exports.getSystemSettings = void 0;
const SystemSettings_1 = __importDefault(require("../models/SystemSettings"));
// @desc    Get Global System Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSystemSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let settings = yield SystemSettings_1.default.findOne();
        // Auto-seed if none exist
        if (!settings) {
            settings = yield SystemSettings_1.default.create({});
        }
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error retrieving system settings' });
    }
});
exports.getSystemSettings = getSystemSettings;
// @desc    Update Global System Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSystemSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mockTestDurationLimit, globalNegativeMarkingRule, aptitudeScoreWeight, codingScoreWeight, readinessThreshold } = req.body;
        let settings = yield SystemSettings_1.default.findOne();
        if (!settings) {
            settings = new SystemSettings_1.default();
        }
        settings.mockTestDurationLimit = mockTestDurationLimit !== undefined ? mockTestDurationLimit : settings.mockTestDurationLimit;
        settings.globalNegativeMarkingRule = globalNegativeMarkingRule !== undefined ? globalNegativeMarkingRule : settings.globalNegativeMarkingRule;
        settings.aptitudeScoreWeight = aptitudeScoreWeight !== undefined ? aptitudeScoreWeight : settings.aptitudeScoreWeight;
        settings.codingScoreWeight = codingScoreWeight !== undefined ? codingScoreWeight : settings.codingScoreWeight;
        settings.readinessThreshold = readinessThreshold !== undefined ? readinessThreshold : settings.readinessThreshold;
        yield settings.save();
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error updating system settings' });
    }
});
exports.updateSystemSettings = updateSystemSettings;
