'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';

export default function AdminDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await API.get('/admin/dashboard');
                setData(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load admin dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-300 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-slate-300 rounded"></div><div className="h-4 bg-slate-300 rounded w-5/6"></div></div></div></div>;
    if (error) return <div className="text-red-500 bg-red-50 p-4 border border-red-200 rounded-md font-mono text-sm">{error}</div>;
    if (!data) return null;

    const { overview, activity, performance, alerts } = data;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Dashboard</h1>
            
            {/* 1. System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard title="Total Students" value={overview.totalStudents} />
                <StatCard title="Instructors" value={overview.totalInstructors} />
                <StatCard title="Active Courses" value={overview.totalCourses} />
                <StatCard title="Tests Taken" value={overview.totalTestsTaken} />
                <StatCard title="Readiness Avg" value={`${overview.avgPlacementReadiness}%`} isHighlight />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Activity Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Recent Registrations</h3>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {activity.recentUsers.map((u: any) => (
                                <li key={u._id} className="px-4 py-3 text-sm flex justify-between items-center hover:bg-slate-50">
                                    <span className="font-medium text-slate-700">{u.name}</span>
                                    <span className="text-slate-500">{u.email}</span>
                                    <span className="text-xs text-slate-400 font-mono">{new Date(u.createdAt).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Latest Test Attempts</h3>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {activity.recentTestAttempts.map((t: any) => (
                                <li key={t._id} className="px-4 py-3 text-sm flex justify-between items-center hover:bg-slate-50">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-700">{t.studentId?.name || 'Unknown Student'}</span>
                                        <span className="text-xs text-slate-500">{t.companyName} Test</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="font-mono text-slate-900 font-semibold">{t.score} pts</span>
                                        <span className="text-xs text-slate-400">{t.accuracy}% acc</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 3. Performance & 4. Alerts Snapshot */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Global Performance</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Company Test Accuracy</span>
                                    <span className="font-bold text-slate-800">{performance.avgAptitudeAccuracy}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${performance.avgAptitudeAccuracy}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-red-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-red-100 bg-red-50 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider">Critical Alerts</h3>
                        </div>
                        <div className="p-4 bg-white">
                            <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">At-Risk Students (Resume &lt; 40)</h4>
                            <ul className="space-y-3">
                                {alerts.atRiskStudents.length === 0 ? (
                                    <li className="text-sm text-slate-500">No students currently at risk.</li>
                                ) : (
                                    alerts.atRiskStudents.map((r: any) => (
                                        <li key={r._id} className="flex justify-between items-center text-sm border-l-2 border-red-400 pl-3">
                                            <span className="font-medium text-slate-700">{r.studentId?.name}</span>
                                            <span className="font-mono text-red-600 font-bold">{r.totalScore}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, isHighlight = false }: { title: string, value: string | number, isHighlight?: boolean }) {
    return (
        <div className={`border rounded-lg p-5 shadow-sm ${isHighlight ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isHighlight ? 'text-indigo-200' : 'text-slate-500'}`}>{title}</h3>
            <p className="text-3xl font-bold font-mono tracking-tight">{value}</p>
        </div>
    );
}
