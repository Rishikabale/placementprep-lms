'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, instructorsRes] = await Promise.all([
                API.get('/admin/courses'),
                API.get('/admin/users?role=instructor')
            ]);
            setCourses(coursesRes.data);
            setInstructors(instructorsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const assignInstructor = async (courseId: string, instructorId: string) => {
        if (!instructorId) return;
        try {
            await API.put(`/admin/courses/${courseId}/assign`, { instructorId });
            fetchData();
        } catch (error) {
            alert('Failed to assign instructor');
        }
    };

    const deleteCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to permanently delete this course?')) return;
        try {
            await API.delete(`/admin/courses/${courseId}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete course');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Administration</h1>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading courses...</td></tr>
                            ) : courses.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No courses found.</td></tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900">{course.title}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-1">ID: {course._id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                            {course.description || 'No description provided'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <select 
                                                className="form-select text-sm border-slate-300 rounded-md py-1"
                                                value={course.instructor?._id || ''}
                                                onChange={(e) => assignInstructor(course._id, e.target.value)}
                                            >
                                                <option value="" disabled>Unassigned</option>
                                                {instructors.map(inst => (
                                                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => deleteCourse(course._id)} 
                                                className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
