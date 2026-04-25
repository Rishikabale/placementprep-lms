'use client';

import { useEffect, useState } from 'react';
import API from '../../../../lib/api';
import Link from 'next/link';

export default function ManageCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await API.get('/courses/my-courses');
                setCourses(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Courses...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
                <Link href="/dashboard/instructor/create-course" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    + Create New Course
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {courses.length === 0 ? (
                        <li className="p-8 text-center text-gray-500">
                            No courses found. Start by creating one!
                        </li>
                    ) : (
                        courses.map((course) => (
                            <li key={course._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                        <span className="text-xs text-gray-500">{course.sections?.length || 0} Sections</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Link href={`/dashboard/instructor/courses/${course._id}`} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">
                                        Edit Content
                                    </Link>
                                    {/* Add delete button later if needed */}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
