'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';

export default function AdminTestsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await API.get('/admin/tests');
                setData(res.data);
            } catch (error) {
                console.error('Failed to load tests', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 text-center">Loading testing metrics...</div>;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Test Activity</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Most Popular Mock Tests</h2>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {data.popularTests.map((pt: any) => (
                            <li key={pt._id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50">
                                <div>
                                    <span className="font-bold text-slate-800">{pt._id}</span>
                                    <div className="text-sm text-slate-500 mt-1">Average Score: {Math.round(pt.avgScore)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono font-medium text-indigo-600">{pt.totalAttempts} Attempts</div>
                                    <div className="text-xs text-slate-400 mt-1">{Math.round(pt.avgAccuracy)}% Global Acc</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Live Testing Feed (Recent 100)</h2>
                    </div>
                    <div className="h-96 overflow-y-auto">
                        <ul className="divide-y divide-slate-100">
                            {data.recentTests.length === 0 ? (
                                <li className="p-6 text-center text-slate-500">No tests taken recently.</li>
                            ) : (
                                data.recentTests.map((t: any) => (
                                    <li key={t._id} className="px-6 py-3 text-sm flex justify-between items-center hover:bg-slate-50">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{t.studentId?.name || 'Deleted User'}</span>
                                            <span className="text-xs text-slate-500 mt-1">{t.companyPatternId?.name}</span>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className={`font-mono font-bold ${t.accuracy > 70 ? 'text-green-600' : t.accuracy < 40 ? 'text-red-500' : 'text-slate-700'}`}>{t.score}</span>
                                            <span className="text-[10px] text-slate-400 mt-1 uppercase">{new Date(t.createdAt).toLocaleString()}</span>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
