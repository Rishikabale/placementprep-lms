import { Request, Response } from 'express';
import SystemSettings from '../models/SystemSettings';

// @desc    Get Global System Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await SystemSettings.findOne();
        
        // Auto-seed if none exist
        if (!settings) {
            settings = await SystemSettings.create({});
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving system settings' });
    }
};

// @desc    Update Global System Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { mockTestDurationLimit, globalNegativeMarkingRule, aptitudeScoreWeight, codingScoreWeight, readinessThreshold } = req.body;

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings();
        }

        settings.mockTestDurationLimit = mockTestDurationLimit !== undefined ? mockTestDurationLimit : settings.mockTestDurationLimit;
        settings.globalNegativeMarkingRule = globalNegativeMarkingRule !== undefined ? globalNegativeMarkingRule : settings.globalNegativeMarkingRule;
        settings.aptitudeScoreWeight = aptitudeScoreWeight !== undefined ? aptitudeScoreWeight : settings.aptitudeScoreWeight;
        settings.codingScoreWeight = codingScoreWeight !== undefined ? codingScoreWeight : settings.codingScoreWeight;
        settings.readinessThreshold = readinessThreshold !== undefined ? readinessThreshold : settings.readinessThreshold;

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating system settings' });
    }
};
