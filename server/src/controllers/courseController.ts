import { Request, Response } from 'express';
import Course from '../models/Course';
import Video from '../models/Video';

export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate('instructor', 'name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getInstructorCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.find({ instructor: (req as any).user._id });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCourseById = async (req: Request, res: Response) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name')
            .populate({
                path: 'modules.videos',
                model: 'Video',
                populate: {
                    path: 'quizId',
                    model: 'Quiz',
                    select: 'title type duration'
                }
            });

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, thumbnail, tags, modules } = req.body;

        const course = new Course({
            title,
            description,
            thumbnail,
            tags,
            modules,
            instructor: (req as any).user._id,
            isPublished: true // Auto publish for simplicity in this project
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const addVideoToCourse = async (req: Request, res: Response) => {
    try {
        const { courseId, moduleIndex, title, duration, description } = req.body;
        let { url } = req.body;

        if (req.file) {
            // If file uploaded, use the local path
            url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const video = new Video({
            title, url, duration, description, courseId
        });
        const createdVideo = await video.save();

        const course = await Course.findById(courseId);
        if (course && course.modules[moduleIndex]) {
            course.modules[moduleIndex].videos.push(createdVideo._id as any);
            await course.save();
            res.status(201).json(createdVideo);
        } else {
            res.status(404).json({ message: "Course or Module not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
}

export const addModuleToCourse = async (req: Request, res: Response) => {
    try {
        const { id: courseId } = req.params;
        const { title } = req.body;

        const course = await Course.findById(courseId);
        if (course) {
            course.modules.push({ title, videos: [] });
            await course.save();
            res.status(201).json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteVideoFromModule = async (req: Request, res: Response) => {
    try {
        const { courseId, moduleIndex, videoId } = req.params;

        const course = await Course.findById(courseId);
        if (course && course.modules[Number(moduleIndex)]) {
            // Remove video reference from module
            course.modules[Number(moduleIndex)].videos = course.modules[Number(moduleIndex)].videos.filter(
                (v: any) => v.toString() !== videoId
            );
            await course.save();

            // Delete actual video document
            await Video.findByIdAndDelete(videoId);

            res.json({ message: 'Video removed' });
        } else {
            res.status(404).json({ message: 'Course or Module not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
