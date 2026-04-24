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
exports.deleteVideoFromModule = exports.addModuleToCourse = exports.addVideoToCourse = exports.createCourse = exports.getCourseById = exports.getInstructorCourses = exports.getCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Video_1 = __importDefault(require("../models/Video"));
const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield Course_1.default.find({ isPublished: true }).populate('instructor', 'name');
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getCourses = getCourses;
const getInstructorCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield Course_1.default.find({ instructor: req.user._id });
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getInstructorCourses = getInstructorCourses;
const getCourseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Course_1.default.findById(req.params.id)
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
        }
        else {
            res.status(404).json({ message: 'Course not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.getCourseById = getCourseById;
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, thumbnail, tags, modules } = req.body;
        const course = new Course_1.default({
            title,
            description,
            thumbnail,
            tags,
            modules,
            instructor: req.user._id,
            isPublished: true // Auto publish for simplicity in this project
        });
        const createdCourse = yield course.save();
        res.status(201).json(createdCourse);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.createCourse = createCourse;
const addVideoToCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, moduleIndex, title, duration, description } = req.body;
        let { url } = req.body;
        if (req.file) {
            // If file uploaded, use the local path
            url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
        const video = new Video_1.default({
            title, url, duration, description, courseId
        });
        const createdVideo = yield video.save();
        const course = yield Course_1.default.findById(courseId);
        if (course && course.modules[moduleIndex]) {
            course.modules[moduleIndex].videos.push(createdVideo._id);
            yield course.save();
            res.status(201).json(createdVideo);
        }
        else {
            res.status(404).json({ message: "Course or Module not found" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.addVideoToCourse = addVideoToCourse;
const addModuleToCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: courseId } = req.params;
        const { title } = req.body;
        const course = yield Course_1.default.findById(courseId);
        if (course) {
            course.modules.push({ title, videos: [] });
            yield course.save();
            res.status(201).json(course);
        }
        else {
            res.status(404).json({ message: 'Course not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.addModuleToCourse = addModuleToCourse;
const deleteVideoFromModule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, moduleIndex, videoId } = req.params;
        const course = yield Course_1.default.findById(courseId);
        if (course && course.modules[Number(moduleIndex)]) {
            // Remove video reference from module
            course.modules[Number(moduleIndex)].videos = course.modules[Number(moduleIndex)].videos.filter((v) => v.toString() !== videoId);
            yield course.save();
            // Delete actual video document
            yield Video_1.default.findByIdAndDelete(videoId);
            res.json({ message: 'Video removed' });
        }
        else {
            res.status(404).json({ message: 'Course or Module not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
exports.deleteVideoFromModule = deleteVideoFromModule;
