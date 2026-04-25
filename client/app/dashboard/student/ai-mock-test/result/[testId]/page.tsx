'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import API from '../../../../../../lib/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function AIResultPage() {
    const { testId } = useParams();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!testId) return;
        API.get(`/ai-mock/result/${testId}`)
            .then(({ data }) => setResult(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [testId]);

    if (loading || !result) return <div>Loading Results...</div>;

    const data = [
        { name: 'Correct', value: result.totalScore },
        { name: 'Incorrect/Skipped', value: result.questions.length - result.totalScore },
    ];
    const COLORS = ['#059669', '#E5E7EB'];

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="mb-8">
                <NextLink href="/dashboard/student/ai-mock-test" className="text-gray-500 hover:text-gray-900">← Back to Dashboard</NextLink>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Summary Card */}
                <div className="md:col-span-1 bg-white shadow rounded-lg p-6 text-center">
                    <h2 className="text-gray-500 font-medium uppercase tracking-wider text-sm">Total Score</h2>
                    <div className="mt-4 text-6xl font-extrabold text-indigo-600">
                        {result.totalScore} <span className="text-2xl text-gray-400">/ {result.maxScore}</span>
                    </div>

                    <div className="h-64 mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Question Breakdown */}
                <div className="md:col-span-2 bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Detailed Analysis</h3>
                    </div>
                    <div className="p-6 max-h-[600px] overflow-y-auto">
                        <ul className="space-y-6">
                            {result.questions.map((q: any, idx: number) => (
                                <li key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                                    <div className="flex items-start">
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white mr-3 ${q.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                            {q.isCorrect ? '✓' : '✗'}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-gray-800 font-medium mb-1">{q.questionId.text}</p>
                                            <div className="text-sm">
                                                <p className="text-gray-500">
                                                    Your Answer: <span className={q.isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                                        {q.selectedOption || 'Skipped'}
                                                    </span>
                                                </p>
                                                {!q.isCorrect && (
                                                    <p className="text-green-700 mt-1">
                                                        Correct: {q.questionId.options.find((o: any) => o.isCorrect)?.text}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{q.difficulty}</span>
                                                <span className="text-xs bg-indigo-50 px-2 py-1 rounded text-indigo-600">{q.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
