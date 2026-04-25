'use client';
import { useEffect, useState } from 'react';
import API from '../../../../../lib/api';
import { useRouter, useParams } from 'next/navigation';
import { FaExclamationTriangle, FaListUl, FaPlayCircle } from 'react-icons/fa';

export default function CompanyTestDetail() {
    const params = useParams();
    const router = useRouter();
    const [pattern, setPattern] = useState<any>(null);

    useEffect(() => {
        const fetchPattern = async () => {
            try {
                const res = await API.get(`/company-patterns/${params.id}`);
                setPattern(res.data);
            } catch (err) {
                console.error(err);
                router.push('/dashboard/student/company-tests');
            }
        };
        fetchPattern();
    }, [params.id, router]);

    if (!pattern) return <div className="p-10 flex justify-center"><div className="animate-pulse flex space-x-4"><div className="rounded-full bg-slate-200 h-10 w-10"></div><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div><div className="h-2 bg-slate-200 rounded"></div></div></div></div></div>;

    const totalQuestions = pattern.sections.reduce((acc: number, sec: any) => acc + sec.questionCount, 0);

    return (
        <div className="p-6 max-w-4xl mx-auto mt-10">
            <div className="bg-white rounded-xl shadow-lg border p-8">
                <div className="border-b pb-6 mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{pattern.name} - Simulation</h1>
                        <p className="text-gray-600 text-lg">Ensure you have an uninterrupted {pattern.totalDuration} minutes before starting.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2"><FaExclamationTriangle className="text-blue-500" /> Exam Rules</h3>
                        <ul className="space-y-4 text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="text-blue-500 font-bold mt-1">•</span>
                                <span>Do not switch tabs during the simulation. Any switching might be recorded.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-500 font-bold mt-1">•</span>
                                <span>The test will automatically finalize and submit when the timer reaches zero.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-500 font-bold mt-1">•</span>
                                <span>Negative Marking is <strong>{pattern.negativeMarking ? `Active (-${pattern.negativeMarkValue} per wrong answer)` : 'Disabled'}</strong>.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2"><FaListUl className="text-blue-500" /> Test Structure</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                                <span className="text-gray-600 font-medium">Total Duration</span>
                                <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded shadow-sm">{pattern.totalDuration} Mins</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                                <span className="text-gray-600 font-medium">Total Questions</span>
                                <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded shadow-sm">{totalQuestions}</span>
                            </div>
                            <div className="pt-2">
                                <span className="text-gray-600 block mb-3 font-medium uppercase text-xs tracking-wider">Sections Overview:</span>
                                <ul className="text-sm font-medium text-gray-800 space-y-2">
                                    {pattern.sections.map((sec: any, idx: number) => (
                                        <li key={idx} className="flex justify-between bg-white p-2.5 rounded shadow-sm border border-blue-100">
                                            <span>{sec.sectionName}</span>
                                            <span className="text-blue-700 bg-blue-100 px-2 rounded">{sec.questionCount} Qs</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end pt-6 border-t">
                    <button 
                        onClick={() => router.push(`/dashboard/student/company-tests/${pattern._id}/take`)}
                        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-3 text-lg"
                    >
                        <FaPlayCircle className="text-xl" /> Start Simulation
                    </button>
                </div>
            </div>
        </div>
    );
}
