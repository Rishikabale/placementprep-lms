'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import API from '../../../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function StudentDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await API.get('/analytics');
                setData(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!data) return <div className="p-10 text-center text-gray-500">Failed to load dashboard data.</div>;

    const { performance, recentTests, readinessScore } = data;
    const adaptiveIndex = performance?.adaptiveIndex || { Quant: 0, Logical: 0, Verbal: 0, Coding: 0 };

    const radarData = [
        { subject: 'Quant', A: adaptiveIndex.Quant, fullMark: 100 },
        { subject: 'Logical', A: adaptiveIndex.Logical, fullMark: 100 },
        { subject: 'Verbal', A: adaptiveIndex.Verbal, fullMark: 100 },
        { subject: 'Coding', A: adaptiveIndex.Coding, fullMark: 100 },
    ];

    const readinessColor = readinessScore >= 80 ? 'text-green-600' : readinessScore >= 60 ? 'text-yellow-600' : 'text-indigo-600';

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* 1. Header & Welcome */}
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Student Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Overview of your placement preparation progress.</p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link href="/dashboard/student/ai-mock-test" className="btn-primary">
                        Start New AI Mock Test
                    </Link>
                </div>
            </div>

            {/* 2. Key Metrics Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <MetricCard label="Readiness Score" value={`${readinessScore}%`} subtext="Overall Preparedness" color={readinessColor} />
                <MetricCard label="Tests Taken" value={recentTests.length} subtext="Total Mock Exams" color="text-gray-900" />
                <MetricCard label="Coding Skill" value={`${adaptiveIndex.Coding}/100`} subtext="Technical Proficiency" color="text-indigo-600" />
                <MetricCard label="Aptitude Avg" value={`${Math.round((adaptiveIndex.Quant + adaptiveIndex.Logical + adaptiveIndex.Verbal) / 3)}/100`} subtext="General Ability" color="text-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Main Content: Capability Radar & Recent Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Capability Radar */}
                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Skill Analysis</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Live Data</span>
                        </div>
                        <div className="h-72 w-full flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Student" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Tests Table */}
                    <div className="glass-card overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Test History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentTests.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No tests taken yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentTests.slice(0, 5).map((test: any) => (
                                            <tr key={test._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(test.completedAt || test.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {test.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {test.totalScore} / {test.maxScore}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium cursor-pointer hover:underline">
                                                    <Link href={`/dashboard/student/ai-mock-test/result/${test._id}`}>View Report</Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                            <Link href="/dashboard/student/test-history" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                View full history <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4. Sidebar: Quick Links & Career */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link href="/dashboard/student/courses" className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Browse Courses
                            </Link>
                            <Link href="/dashboard/student/career-insights" className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                                View Career Insights
                            </Link>
                        </div>
                    </div>

                    {/* Weak Areas */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus Areas</h3>
                        <p className="text-sm text-gray-500 mb-4">Topics needing improvement based on recent performance.</p>
                        <ul className="space-y-3">
                            {Object.entries(adaptiveIndex).map(([subject, score]: any) => (
                                score < 50 && (
                                    <li key={subject} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                                        <span className="text-sm font-medium text-red-800">{subject}</span>
                                        <span className="text-xs font-bold text-red-600">{score}/100</span>
                                    </li>
                                )
                            ))}
                            {!Object.values(adaptiveIndex).some((s: any) => s < 50) && (
                                <li className="text-sm text-green-600">
                                    All topics looking good!
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, subtext, color }: any) {
    return (
        <div className="glass-card p-6 flex flex-col justify-between h-32">
            <dt>
                <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
            </dt>
            <dd>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <p className="text-xs text-gray-400 mt-1">{subtext}</p>
            </dd>
        </div>
    );
}
