'use client';

import { useEffect, useState } from 'react';
import API from '../../../../lib/api';
import Link from 'next/link';

export default function StudentCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await API.get('/courses');
                // Filter only published courses for students
                setCourses(data.filter((c: any) => c.isPublished));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
                <p className="mt-2 text-sm text-gray-500">Explore and enroll in courses to boost your placement readiness.</p>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg">No courses available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Link href={`/dashboard/student/courses/${course._id}`} key={course._id} className="group block h-full">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col hover:border-indigo-100">
                                {/* Course Thumbnail Placeholder */}
                                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-100">
                                    <span className="text-4xl font-bold text-gray-300 group-hover:text-indigo-200 transition-colors">
                                        {course.title.charAt(0)}
                                    </span>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                            Course
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-3 line-clamp-2">
                                        {course.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                                        {course.description || "Master this subject with expert-curated modules and assessments."}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">
                                            {course.sections?.length || 0} Modules
                                        </span>
                                        <span className="text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                                            Start Learning &rarr;
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
