'use client';

import { useEffect, useState, use } from 'react';
import API from '../../../../../../lib/api';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function MockTestResultPage({ params }: { params: Promise<{ resultId: string }> }) {
    const { resultId } = use(params);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const { data } = await API.get(`/mock-tests/results/${resultId}`);
                setResult(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [resultId]);

    if (loading) return <div>Loading Analysis...</div>;
    if (!result) return <div>Result not found</div>;

    // Chart Data Preparation
    const scoreData = [
        { name: 'Your Score', value: result.totalScore },
        { name: 'Lost Marks', value: result.maxScore - result.totalScore }
    ];
    const COLORS = ['#4F46E5', '#E5E7EB'];

    const sectionData = result.sectionResults.map((sec: any) => ({
        name: sec.sectionName,
        Score: sec.score,
        Total: sec.weightage * sec.totalQuestions // Approx total for sec
    }));

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex md:flex-row flex-col justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{result.pattern?.name} Analysis</h1>
                    <p className="text-gray-500 mt-1">Completed on {new Date(result.completedAt).toLocaleString()}</p>
                </div>
                <Link
                    href="/dashboard/student/mock-tests"
                    className="mt-4 md:mt-0 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Back to Dashboard
                </Link>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-indigo-500">
                    <p className="text-sm text-gray-500 font-medium">Total Score</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{result.totalScore} <span className="text-base text-gray-400 font-normal">/ {result.maxScore}</span></p>
                    <p className="text-xs text-green-600 mt-1 font-medium">{Math.round(result.percentage)}% Accuracy</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-purple-500">
                    <p className="text-sm text-gray-500 font-medium">Percentile</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{result.percentile.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Better than {result.percentile.toFixed(1)}% of students</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                    <p className="text-sm text-gray-500 font-medium">Readiness Level</p>
                    <p className={`text-2xl font-bold mt-2 truncate ${result.readinessLevel === 'Highly Ready' ? 'text-green-600' :
                        result.readinessLevel === 'Moderately Ready' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {result.readinessLevel}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-gray-500">
                    <p className="text-sm text-gray-500 font-medium">Time Taken</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Score Dist */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Performance Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={scoreData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {scoreData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Section Analysis */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Section-wise Analysis</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sectionData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="Score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Answers */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Solutions</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {result.answers.map((ans: any, idx: number) => (
                        <li key={idx} className="px-6 py-4">
                            <div className="flex items-start">
                                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-4 ${ans.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <p className="text-sm font-medium text-gray-900">Question ID: {ans.questionId}</p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${ans.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {ans.isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600">Your Answer: <span className="font-medium">{ans.selectedOption || 'Skipped'}</span></p>

                                    {/* Ideally we fetch question text here too if we populated it, but keeping it simple */}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
