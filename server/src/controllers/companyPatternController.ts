import { Request, Response } from 'express';
import CompanyPattern from '../models/CompanyPattern';

// @desc    Create a new company pattern
// @route   POST /api/company-patterns
// @access  Private (Instructor/Admin)
export const createCompanyPattern = async (req: Request, res: Response) => {
    try {
        const { name, description, totalDuration, negativeMarking, negativeMarkValue, sections, isPublic, isGlobal } = req.body;
        const user = (req as any).user;

        const pattern = new CompanyPattern({
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

        const createdPattern = await pattern.save();
        res.status(201).json(createdPattern);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all company patterns
// @route   GET /api/company-patterns
// @access  Private
export const getCompanyPatterns = async (req: Request, res: Response) => {
    try {
        const filter = req.query.filter as string;
        const user = (req as any).user;
        let query: any = {};

        if (filter === 'mine') {
            query.createdBy = user._id;
        } else if (filter === 'community') {
            query.isPublic = true;
            query.isGlobal = false;
        } else if (filter === 'global') {
            query.isGlobal = true;
        } else {
            query = {
                $or: [
                    { createdBy: user._id },
                    { isPublic: true },
                    { isGlobal: true }
                ]
            };
        }

        const patterns = await CompanyPattern.find(query).populate('createdBy', 'name email');
        res.json(patterns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single company pattern
// @route   GET /api/company-patterns/:id
// @access  Private
export const getCompanyPatternById = async (req: Request, res: Response) => {
    try {
        const pattern = await CompanyPattern.findById(req.params.id);
        if (pattern) {
            res.json(pattern);
        } else {
            res.status(404).json({ message: 'Pattern not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete company pattern
// @route   DELETE /api/company-patterns/:id
// @access  Private (Instructor/Admin)
export const deleteCompanyPattern = async (req: Request, res: Response) => {
    try {
        const pattern = await CompanyPattern.findById(req.params.id);
        const user = (req as any).user;
        
        if (pattern) {
            if (pattern.isGlobal && user.role !== 'admin') {
                res.status(403).json({ message: 'Not authorized to delete global patterns' });
                return;
            }
            
            if (pattern.createdBy?.toString() !== user._id.toString() && user.role !== 'admin') {
                res.status(403).json({ message: 'Not authorized to delete this pattern' });
                return;
            }
            
            await pattern.deleteOne();
            res.json({ message: 'Pattern removed' });
        } else {
            res.status(404).json({ message: 'Pattern not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Clone an existing company pattern
// @route   POST /api/company-patterns/:id/clone
// @access  Private (Instructor/Admin)
export const cloneCompanyPattern = async (req: Request, res: Response) => {
    try {
        const originalPattern = await CompanyPattern.findById(req.params.id);
        if (!originalPattern) {
            res.status(404).json({ message: 'Pattern not found' });
            return;
        }

        const user = (req as any).user;
        const clonedPattern = new CompanyPattern({
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

        const savedClone = await clonedPattern.save();
        res.status(201).json(savedClone);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Seed global company patterns
// @route   POST /api/company-patterns/seed
// @access  Private (Admin)
export const seedGlobalPatterns = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
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
            const exists = await CompanyPattern.findOne({ name: company.name });
            if (!exists) {
                await CompanyPattern.create({ ...company, createdBy: user._id });
            }
        }

        res.status(201).json({ message: 'Global patterns seeded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
