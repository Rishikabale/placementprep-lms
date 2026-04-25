'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import API from '../../../../lib/api';

export default function AIMockTestLandingPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/ai-mock/history')
            .then(({ data }) => setHistory(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI-Generated Mock Tests </h1>
                    <p className="mt-2 text-gray-600">Adaptive tests generated on demand to fit your skill level.</p>
                </div>
                <Link
                    href="/dashboard/student/ai-mock-test/configure"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 shadow-lg transition-all"
                >
                    + Generate New Test
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">Your Adaptive Test History</h3>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 mb-4">No AI mock tests taken yet.</p>
                        <Link href="/dashboard/student/ai-mock-test/configure" className="text-indigo-600 hover:text-indigo-800 font-medium">start your first test</Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {history.map((test) => (
                            <li key={test._id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-gray-800">{test.type}</p>
                                        <span className="text-sm text-gray-500">{new Date(test.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${test.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                                            test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {test.difficulty}
                                        </span>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">{test.totalScore} / {test.maxScore}</p>
                                            <p className="text-xs text-gray-500">Score</p>
                                        </div>
                                        <Link
                                            href={`/dashboard/student/ai-mock-test/result/${test._id}`}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                        >
                                            View Report →
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
