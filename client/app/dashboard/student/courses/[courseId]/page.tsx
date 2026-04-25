'use client';

import { useEffect, useState, use } from 'react';
import API from '../../../../../lib/api';
import Link from 'next/link';

export default function StudentCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = use(params);
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<any[]>([]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await API.get(`/courses/${courseId}`);
                setCourse(data);

                // Fetch Progress (if any)
                try {
                    const progRes = await API.get(`/courses/${courseId}/progress`);
                    setProgress(progRes.data);
                } catch (err) {
                    // Ignore if no progress yet
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!course) return <div className="p-10 text-center">Course not found.</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link href="/dashboard/student/courses" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-4 inline-block">
                    &larr; Back to Courses
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                        <p className="mt-2 text-lg text-gray-500 max-w-3xl">{course.description}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {course.modules && course.modules.length > 0 ? (
                                course.modules.map((module: any, idx: number) => (
                                    <li key={module._id || idx} className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{module.title}</h3>
                                        <ul className="space-y-3">
                                            {module.videos.map((video: any) => {
                                                const isCompleted = progress.some(p => p.contentId === video._id && p.completed);
                                                return (
                                                    <li key={video._id} className="flex flex-col gap-2 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                                    {isCompleted ? '✓' : '▶'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                                        {video.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">{Math.floor(video.duration / 60)} mins</p>
                                                                </div>
                                                            </div>
                                                            <Link
                                                                href={`/courses/${course._id}?videoId=${video._id}`}
                                                                className="text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                                                            >
                                                                Watch
                                                            </Link>
                                                        </div>

                                                        {/* Quiz Attachment */}
                                                        {video.quizId && (
                                                            <div className="ml-11 flex items-center justify-between p-2 bg-yellow-50 border border-yellow-100 rounded-md">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-yellow-600 text-sm">📝</span>
                                                                    <span className="text-xs font-medium text-yellow-800">
                                                                        Quiz: {video.quizId.title} ({video.quizId.duration} mins)
                                                                    </span>
                                                                </div>
                                                                <Link
                                                                    href={`/dashboard/student/quiz/${video.quizId._id}`}
                                                                    className="text-xs font-bold text-yellow-700 hover:text-yellow-900 underline"
                                                                >
                                                                    Take Quiz
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                ))
                            ) : (
                                <li className="p-6 text-center text-gray-500">No content available yet.</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Course Progress</h3>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                            {/* Calculate real progress here if needed */}
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-sm text-gray-500">0% Completed</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
