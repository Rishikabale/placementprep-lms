'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';

export default function AdminResumesPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await API.get('/admin/resumes');
                setData(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResumes();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Analyzing resume intelligence pool...</div>;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Resume Intelligence Pool</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Prevalent Weaknesses</h2>
                        <p className="text-xs text-slate-500 mt-1">Aggregated issues preventing ATS parsing.</p>
                    </div>
                    <ul className="divide-y divide-slate-100 bg-white">
                        {data.commonWeaknesses.map((w: any, idx: number) => (
                            <li key={idx} className="px-6 py-4 flex flex-col hover:bg-slate-50">
                                <span className="font-medium text-slate-800 text-sm">{w._id}</span>
                                <span className="text-xs font-mono font-bold text-red-500 mt-1">Flagged {w.frequency} times globally</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Top Skills Density</h2>
                        </div>
                        <div className="p-6 flex flex-wrap gap-2">
                            {data.topSkills.map((s: any, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold uppercase tracking-wider">
                                    {s._id} <span className="opacity-50 ml-1">({s.frequency})</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Section Quality Averages</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {data.avgSectionScores.map((sec: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                    <span className="font-medium text-slate-700">{sec._id}</span>
                                    <span className="font-mono font-semibold text-indigo-600">{Math.round(sec.avgScore)} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
