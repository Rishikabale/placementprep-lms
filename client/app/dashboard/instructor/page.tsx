'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function InstructorDashboard() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Courses
                const coursesRes = await API.get('/courses/my-courses');
                setCourses(coursesRes.data);

                // Fetch Analytics
                const analyticsRes = await API.get('/analytics/instructor');
                setAnalytics(analyticsRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    const { summary, weakTopics } = analytics || { summary: {}, weakTopics: [] };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instructor Hub</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your curriculum and monitor student performance.</p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0">
                    <Link href="/dashboard/instructor/question-bank" className="btn-secondary">
                        Question Bank
                    </Link>
                    <Link href="/dashboard/instructor/create-course" className="btn-primary">
                        + Create Course
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Total Students"
                    value={summary.totalStudents || 0}
                    color="text-indigo-600"
                />
                <StatCard
                    title="Active Courses"
                    value={summary.totalCourses || 0}
                    color="text-indigo-600"
                />
                <StatCard
                    title="Tests Taken"
                    value={summary.totalTestsTaken || 0}
                    color="text-indigo-600"
                />
                <StatCard
                    title="Global Avg Score"
                    value={`${summary.avgScore || 0}%`}
                    color="text-green-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Courses List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Your Courses</h3>
                            <Link href="/dashboard/instructor/courses" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {courses.length === 0 ? (
                                <li className="p-8 text-center text-gray-500">
                                    No courses yet. <Link href="/dashboard/instructor/create-course" className="text-indigo-600 font-medium">Create your first one!</Link>
                                </li>
                            ) : (
                                courses.slice(0, 5).map((course) => (
                                    <li key={course._id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold mr-4 text-lg border border-indigo-100">
                                                {course.title.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{course.title}</p>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {course.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{course.sections?.length || 0} Sections</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/dashboard/instructor/courses/${course._id}`} className="text-gray-400 hover:text-indigo-600 p-2 text-sm font-medium">
                                            Manage
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                {/* Weak Spots Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Weak Points</h3>
                        <p className="text-sm text-gray-500 mb-6">Topics where students are scoring lowest globally.</p>

                        <div className="space-y-4">
                            {weakTopics && weakTopics.length > 0 ? (
                                weakTopics.map((topic: any, idx: number) => (
                                    <div key={idx} className="">
                                        <div className="flex mb-1 items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">{topic.category}</span>
                                            <span className="text-sm font-bold text-red-600">{Math.round(topic.accuracy)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${topic.accuracy}%` }}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">Not enough data to analyze yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-indigo-900 rounded-xl shadow-lg p-6 text-white text-center">
                        <h3 className="font-bold text-lg mb-2">Content Strategy</h3>
                        <p className="text-sm text-indigo-200 mb-4">
                            Boost student readiness by adding a quiz for <strong>{weakTopics?.[0]?.category || 'General Aptitude'}</strong>.
                        </p>
                        <Link href="/dashboard/instructor/create-course" className="inline-block bg-white text-indigo-900 px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-100 transition-colors">
                            Draft New Content
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color }: any) {
    return (
        <div className="glass-card p-6 flex flex-col justify-between h-32">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
            </div>
        </div>
    );
}
