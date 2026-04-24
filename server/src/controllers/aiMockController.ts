import { Request, Response } from 'express';
import * as AIMockService from '../services/aiMockGeneratorService';
import AIMockTest from '../models/AIMockTest';

export const generateTest = async (req: any, res: Response) => {
    try {
        const { type, difficulty, duration } = req.body;
        const studentId = req.user.id;

        const test = await AIMockService.generateAIMockTest(studentId, type, difficulty, duration);
        res.status(201).json(test);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate test' });
    }
};

export const submitTest = async (req: any, res: Response) => {
    try {
        const { testId, answers } = req.body;
        const result = await AIMockService.submitAIMockTest(testId, answers);
        res.json(result);
    } catch (error: any) {
        console.error(error);
        if (error.message === 'Test not found' || error.message === 'Test already submitted') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Submission failed' });
    }
};

export const getTestResult = async (req: Request, res: Response) => {
    try {
        const test = await AIMockTest.findById(req.params.id).populate('questions.questionId');
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.json(test);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getStudentHistory = async (req: any, res: Response) => {
    try {
        const history = await AIMockTest.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .select('type difficulty totalScore maxScore createdAt readinessLevel');
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
