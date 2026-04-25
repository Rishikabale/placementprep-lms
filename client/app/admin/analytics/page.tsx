'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await API.get('/admin/analytics');
                setData(res.data);
            } catch (error) {
                console.error('Failed to load analytics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Crunching vast amounts of placement data...</div>;
    if (!data) return null;

    const maxCount = Math.max(...data.resumeScoreDistribution.map((d: any) => d.count), 1);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Placement Analytics Engine</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Score Distribution (Custom CSS Histogram) */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-6">Resume Readiness Distribution</h2>
                    <div className="flex items-end justify-between h-48 space-x-2 mt-4">
                        {data.resumeScoreDistribution.map((bucket: any, idx: number) => {
                            const heightPercentage = (bucket.count / maxCount) * 100;
                            return (
                                <div key={idx} className="flex flex-col items-center flex-1 group">
                                    <div className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 mb-2 transition-opacity font-mono">{bucket.count} users</div>
                                    <div 
                                        className="w-full bg-slate-800 rounded-t-sm hover:bg-indigo-600 transition-colors" 
                                        style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                                    ></div>
                                    <div className="text-[10px] text-slate-400 mt-2 text-center break-words w-full">
                                        {typeof bucket._id === 'number' ? `${bucket._id}-${bucket._id+20}` : bucket._id}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Most Failed Topics */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-6">Lowest Performing Topics</h2>
                    <div className="space-y-4">
                        {data.weakestSections.length === 0 ? (
                            <p className="text-sm text-slate-500">Not enough test data.</p>
                        ) : data.weakestSections.map((topic: any, idx: number) => {
                            const maxFails = data.weakestSections[0].count;
                            const width = (topic.count / maxFails) * 100;
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700 uppercase">{topic._id}</span>
                                        <span className="text-red-500 font-mono italic">{topic.count} marked weak</span>
                                    </div>
                                    <div className="w-full bg-red-50 rounded-full h-1.5 border border-red-100">
                                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${width}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top 10 Leaderboard */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Top 10 Global Students (By Mock Test Accuracy)</h2>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tests Taken</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Accuracy</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {data.topStudents.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No students qualify for ranking yet.</td></tr>
                            ) : data.topStudents.map((rank: any, i: number) => (
                                <tr key={rank._id?._id} className="hover:bg-amber-50/30">
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 font-mono">#{i + 1}</td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{rank._id?.name}</div>
                                        <div className="text-xs text-slate-500">{rank._id?.email}</div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-700">{rank.testsTaken}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-bold text-amber-600 font-mono">
                                        {Math.round(rank.avgAccuracy)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
