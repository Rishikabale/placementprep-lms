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
exports.deleteCourse = exports.assignInstructor = exports.getAllCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all courses with instructor details
// @route   GET /api/admin/courses
// @access  Private/Admin
const getAllCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield Course_1.default.find()
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error retrieving courses' });
    }
});
exports.getAllCourses = getAllCourses;
// @desc    Assign an instructor to a course
// @route   PUT /api/admin/courses/:courseId/assign
// @access  Private/Admin
const assignInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { instructorId } = req.body;
        const instructor = yield User_1.default.findOne({ _id: instructorId, role: 'instructor' });
        if (!instructor) {
            res.status(404).json({ message: 'Instructor not found or invalid role' });
            return;
        }
        const course = yield Course_1.default.findById(req.params.courseId);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        course.instructor = instructor._id;
        yield course.save();
        res.json({ message: 'Instructor assigned successfully', course });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error assigning instructor' });
    }
});
exports.assignInstructor = assignInstructor;
// @desc    Delete or disable a course
// @route   DELETE /api/admin/courses/:courseId
// @access  Private/Admin
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Course_1.default.findById(req.params.courseId);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        yield course.deleteOne();
        res.json({ message: 'Course removed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error deleting course' });
    }
});
exports.deleteCourse = deleteCourse;
