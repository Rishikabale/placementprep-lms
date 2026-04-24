import { Request, Response } from 'express';
import Course from '../models/Course';
import User from '../models/User';

// @desc    Get all courses with instructor details
// @route   GET /api/admin/courses
// @access  Private/Admin
export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
    try {
        const courses = await Course.find()
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving courses' });
    }
};

// @desc    Assign an instructor to a course
// @route   PUT /api/admin/courses/:courseId/assign
// @access  Private/Admin
export const assignInstructor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { instructorId } = req.body;
        
        const instructor = await User.findOne({ _id: instructorId, role: 'instructor' });
        if (!instructor) {
            res.status(404).json({ message: 'Instructor not found or invalid role' });
            return;
        }

        const course = await Course.findById(req.params.courseId);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        course.instructor = instructor._id as any;
        await course.save();

        res.json({ message: 'Instructor assigned successfully', course });
    } catch (error) {
        res.status(500).json({ message: 'Server error assigning instructor' });
    }
};

// @desc    Delete or disable a course
// @route   DELETE /api/admin/courses/:courseId
// @access  Private/Admin
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        await course.deleteOne();
        res.json({ message: 'Course removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting course' });
    }
};
