'use client';
import { useEffect, useState } from 'react';
import API from '../../../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FaBullseye, FaChartBar, FaCheckCircle, FaExclamationTriangle, FaTrophy } from 'react-icons/fa';

export default function TestResult() {
    const params = useParams();
    const router = useRouter();
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await API.get(`/company-test/result/${params.attemptId}`);
                setResult(res.data);
            } catch (err) {
                console.error(err);
                alert("Failed to fetch analytical result");
                router.push('/dashboard/student/company-tests');
            }
        };
        fetchResult();
    }, [params.attemptId, router]);

    if(!result) return <div className="p-10 text-center animate-pulse text-xl text-blue-600 font-medium">Generating Advanced Analytics...</div>;

    const COLORS = ['#10B981', '#F43F5E', '#CBD5E1']; // correct, incorrect, unattempted

    const correctAnsCount = result.sectionScores.reduce((acc: number, sec: any) => acc + sec.correctAnswers, 0);
    const totalQuestionsCount = result.sectionScores.reduce((acc: number, sec: any) => acc + sec.totalQuestions, 0);
    const incorrectAnsCount = result.responses.length - correctAnsCount;
    const unattemptedCount = totalQuestionsCount - result.responses.length;

    const pieData = [
        { name: 'Correct', value: correctAnsCount },
        { name: 'Incorrect', value: incorrectAnsCount },
        { name: 'Skipped', value: unattemptedCount }
    ];

    const barData = result.sectionScores.map((sec: any) => ({
        name: sec.sectionName,
        Accuracy: sec.totalQuestions > 0 ? ((sec.correctAnswers / sec.totalQuestions) * 100).toFixed(0) : 0,
        Score: sec.score
    }));

    const pattern = result.companyPatternId;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-8 tracking-tight">{result.companyName} Test Analytics</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                    <FaTrophy className="text-4xl text-yellow-500 mb-4" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Score</h3>
                    <p className="text-4xl font-black text-slate-800 mt-2">{Number(result.score).toFixed(2).replace(/\.00$/, '')}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                    <FaBullseye className="text-4xl text-blue-500 mb-4" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Accuracy</h3>
                    <p className="text-4xl font-black text-slate-800 mt-2">{result.accuracy}%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                    <FaCheckCircle className="text-4xl text-emerald-500 mb-4" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Correct Answers</h3>
                    <p className="text-4xl font-black text-slate-800 mt-2">{correctAnsCount} <span className="text-lg text-slate-400">/ {totalQuestionsCount}</span></p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 bg-rose-50 flex flex-col justify-center items-center text-center">
                    <FaExclamationTriangle className="text-4xl text-rose-500 mb-4" />
                    <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest">Weakest Section</h3>
                    <p className="text-xl font-bold text-slate-800 mt-2">{result.weakestSection}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FaChartBar className="text-indigo-500" /> Overall Breakdown</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} Qs`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 text-sm font-medium mt-4">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Correct</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div>Incorrect</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div>Skipped</div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Section-wise Accuracy</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 mb-6 mt-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-4">Improvement Suggestions</h2>
                <div className="text-indigo-800 leading-relaxed max-w-3xl space-y-2">
                    <p>Based on your results, your weakest area is <strong className="font-black text-indigo-900">{result.weakestSection}</strong>.</p>
                    {pattern?.negativeMarking && incorrectAnsCount > 0 && <p className="text-rose-600 font-medium">Wait! We noticed the negative marking policy has impacted your score. Avoid guessing multiple-choice answers if you are uncertain to minimize penalties.</p>}
                    <p>Review the {result.weakestSection} modules to improve your baseline accuracy before your next attempt at the {result.companyName} pattern.</p>
                </div>
                <div className="mt-8 flex gap-4">
                    <button onClick={() => router.push('/dashboard/student/company-tests')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition">
                        Back to Test Center
                    </button>
                    <button onClick={() => router.push(`/dashboard/student/courses`)} className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold py-3 px-8 rounded-lg shadow-sm transition">
                        Study Weak Topics
                    </button>
                </div>
            </div>

            {/* Detailed Question Review Section */}
            <div className="mt-12 space-y-8 pb-10">
                <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                        <FaChartBar className="text-indigo-500" /> Detailed Question Review
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Review your answers, see correct options, and learn from your mistakes.</p>
                </div>
                
                <div className="space-y-6">
                    {result.responses.map((response: any, idx: number) => {
                        const question = response.questionId;
                        if (!question) return null; // Defensive check
                        
                        // Status badge logic
                        let statusBadge = null;
                        if (response.isCorrect) {
                            statusBadge = <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 gap-1"><FaCheckCircle /> Correct</span>;
                        } else if (!response.selectedOptionId) {
                            statusBadge = <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 gap-1">⚠️ Skipped</span>;
                        } else {
                            statusBadge = <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 gap-1"><FaExclamationTriangle /> Incorrect</span>;
                        }

                        return (
                            <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-5">
                                    <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                        Q{idx + 1} • {question.category}
                                    </span>
                                    {statusBadge}
                                </div>
                                <h3 className="text-xl text-slate-800 font-medium mb-6 leading-relaxed">
                                    {question.text}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {question.options?.map((opt: any, optIdx: number) => {
                                        const isSelected = response.selectedOptionId === opt._id;
                                        const isActualCorrect = opt.isCorrect;

                                        let optionStyles = "border-slate-200 bg-white text-slate-700 hover:border-slate-300"; // default
                                        let icon = null;

                                        if (isActualCorrect) {
                                            optionStyles = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-500 font-medium";
                                            icon = <FaCheckCircle className="text-emerald-500 text-xl" />;
                                        } else if (isSelected && !isActualCorrect) {
                                            optionStyles = "border-rose-500 bg-rose-50 text-rose-900 shadow-sm ring-1 ring-rose-500 font-medium";
                                            icon = <FaExclamationTriangle className="text-rose-500 text-xl" />;
                                        }

                                        return (
                                            <div key={optIdx} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${optionStyles}`}>
                                                <span className="text-base">{opt.text}</span>
                                                {icon && <div className="ml-4 shrink-0 animate-fade-in">{icon}</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
