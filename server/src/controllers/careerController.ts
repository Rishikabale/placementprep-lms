import { Request, Response } from 'express';
import * as CareerEngine from '../services/careerRecommendationEngine';
import CareerRecommendation from '../models/CareerRecommendation';
import CareerRole from '../models/CareerRole';

export const getRecommendations = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;

        // Check for existing recent recommendation
        const recent = await CareerRecommendation.findOne({ student: studentId }).sort({ generatedAt: -1 });

        // If recent (< 24 hours), return it
        // ... simplistic check for now, let's just return it if it exists
        if (recent) {
            return res.json(recent);
        }

        // Else generate new
        const newRec = await CareerEngine.generateCareerRecommendation(studentId);
        res.json(newRec);

    } catch (error: any) {
        console.error(error);
        if (error.message.includes('No mock test data')) {
            return res.status(400).json({ message: 'Please take at least one mock test to generate career insights.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

export const recalculateRecommendations = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const newRec = await CareerEngine.generateCareerRecommendation(studentId);
        res.json(newRec);
    } catch (error: any) {
        console.error(error);
        if (error.message.includes('No mock test data')) {
            return res.status(400).json({ message: 'Please take at least one mock test to generate career insights.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCareerRoles = async (req: Request, res: Response) => {
    try {
        const roles = await CareerRole.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createCareerRole = async (req: Request, res: Response) => {
    try {
        const role = await CareerRole.create(req.body);
        res.status(201).json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
