'use client';

import { useState, useEffect } from 'react';
import API from '../../../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaBriefcase, FaDownload } from 'react-icons/fa';

export default function ResumeResultDashboard() {
    const params = useParams();
    const router = useRouter();
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await API.get(`/resume/result/${params.id}`);
                setResult(res.data);
            } catch (err) {
                console.error("Failed to load result", err);
                router.push('/dashboard/student/resume-analyzer');
            }
        };
        fetchResult();
    }, [params.id, router]);

    if (!result) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="animate-pulse text-indigo-600 font-bold text-xl tracking-widest">Processing Analysis Matrix...</div></div>;

    const getScoreColor = (score: number, max: number) => {
        const ratio = score / max;
        if (ratio >= 0.8) return 'bg-emerald-500';
        if (ratio >= 0.5) return 'bg-yellow-500';
        return 'bg-rose-500';
    };

    const overallRatio = result.totalScore / 100;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans bg-gray-50 min-h-screen">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => router.push('/dashboard/student/resume-analyzer')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-semibold transition">
                    <FaArrowLeft /> Back to Analyzer
                </button>
                <div className="text-sm font-medium text-gray-400">
                    Analyzed on {new Date(result.createdAt).toLocaleString()}
                </div>
            </div>

            {/* Top Stat Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                
                {/* Massive Total Score Dial representing ATS Success */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center items-center relative overflow-hidden h-72 lg:col-span-1">
                    <div className={`absolute top-0 left-0 right-0 h-2 ${overallRatio >= 0.75 ? 'bg-emerald-500' : overallRatio > 0.4 ? 'bg-yellow-400' : 'bg-rose-500'}`}></div>
                    <h2 className="text-gray-400 uppercase tracking-widest font-black text-sm mb-4">ATS Compatibility Score</h2>
                    
                    <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-[10px] border-gray-100 mb-2 shadow-inner">
                        <div className="text-6xl font-black text-gray-800 tracking-tighter z-10">{result.totalScore}</div>
                        {/* Circular progress visual mock */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                                className={`${overallRatio >= 0.75 ? 'text-emerald-500' : overallRatio > 0.4 ? 'text-yellow-400' : 'text-rose-500'}`} 
                                strokeDasharray={`${overallRatio * 283} 283`} strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className={`text-sm font-bold mt-2 ${overallRatio >= 0.75 ? 'text-emerald-600' : overallRatio > 0.4 ? 'text-yellow-600' : 'text-rose-600'}`}>
                        {overallRatio >= 0.75 ? 'Excellent Candidate Profile' : overallRatio > 0.4 ? 'Needs Improvements' : 'Critical Formatting Errors'}
                    </span>
                </div>

                {/* Granular Section Scores */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:col-span-2 flex flex-col justify-center">
                    <h2 className="text-gray-800 font-extrabold text-xl mb-6">Component Breakdown</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {result.sectionScores.map((sec: any, idx: number) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="font-bold text-gray-700 text-sm">{sec.sectionName}</span>
                                    <span className="text-xs font-black text-gray-900">{sec.score} / {sec.maxScore}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 shadow-inner overflow-hidden">
                                    <div className={`h-full rounded-full ${getScoreColor(sec.score, sec.maxScore)}`} style={{ width: `${(sec.score / sec.maxScore) * 100}%` }}></div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 italic truncate">{sec.feedback}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Details Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Automated Feedback Action List */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Suggestions (Priority 1) */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-indigo-50 opacity-50"><FaLightbulb className="text-9xl" /></div>
                        <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-3 relative z-10"><FaLightbulb className="text-indigo-500" /> Actionable Suggestions</h3>
                        {result.suggestions?.length > 0 ? (
                            <ul className="space-y-4 relative z-10">
                                {result.suggestions.map((sug: string, i: number) => (
                                    <li key={i} className="flex gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                        <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">{i+1}</div>
                                        <span className="text-gray-700 leading-relaxed font-medium">{sug}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-semibold flex items-center gap-3">
                                <FaCheckCircle /> Your resume requires no further structural suggestions!
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Strengths */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                            <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2"><FaCheckCircle className="text-emerald-500" /> Key Strengths</h3>
                            <ul className="space-y-3">
                                {result.strengths.map((str: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2 border-b border-gray-50 pb-2 last:border-0"><span className="text-emerald-500 mt-1">✓</span> {str}</li>
                                ))}
                                {result.strengths.length === 0 && <li className="text-sm text-gray-400 italic">No profound strengths detected automatically.</li>}
                            </ul>
                        </div>
                        
                        {/* Weaknesses */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
                            <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2"><FaExclamationTriangle className="text-rose-500" /> Identified Flags</h3>
                            <ul className="space-y-3">
                                {result.weaknesses.map((wk: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2 border-b border-gray-50 pb-2 last:border-0"><span className="text-rose-500 mt-1">✗</span> {wk}</li>
                                ))}
                                {result.weaknesses.length === 0 && <li className="text-sm text-emerald-600 font-medium">No negative logic flags detected!</li>}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Career Matching & Tags */}
                <div className="space-y-8">
                    
                    {/* Extracted Skills Array */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Keywords Extracted</h3>
                        <p className="text-xs text-gray-400 mb-4">Hard skills parsed from the document</p>
                        
                        <div className="flex flex-wrap gap-2">
                            {result.extractedSkills?.length > 0 ? result.extractedSkills.map((sk: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-bold text-gray-700 uppercase tracking-widest">
                                    {sk}
                                </span>
                            )) : (
                                <span className="text-sm text-rose-500 font-medium">No standardized tech skills found. Ensure you spell technologies exactly as they appear in job descriptions.</span>
                            )}
                        </div>
                    </div>

                    {/* Career Alignment Matrix */}
                    <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border-4 border-slate-800 relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg"><FaBriefcase className="text-white text-xl" /></div>
                            <div>
                                <h3 className="text-lg font-extrabold text-white leading-tight">Career Match</h3>
                                <p className="text-slate-400 text-xs">Based on skillset density</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {result.careerFit?.map((fit: any, idx: number) => (
                                <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-indigo-500 transition">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-emerald-50 truncate max-w-[70%]">{fit.roleName}</span>
                                        <span className={`text-sm font-black px-2 py-0.5 rounded ${fit.matchPercentage > 60 ? 'bg-emerald-400 text-emerald-950' : 'bg-yellow-400 text-yellow-950'}`}>{fit.matchPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-full rounded-full ${fit.matchPercentage > 60 ? 'bg-emerald-400' : 'bg-yellow-400'}`} style={{ width: `${fit.matchPercentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
