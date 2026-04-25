'use client';

import { useEffect, useState } from 'react';
import API from '../../../../lib/api';
import Link from 'next/link';

export default function MockTestListPage() {
    const [patterns, setPatterns] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patternsRes, historyRes] = await Promise.all([
                    API.get('/company-patterns'),
                    API.get('/mock-tests/history')
                ]);
                setPatterns(patternsRes.data);
                setHistory(historyRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Mock Interviews & Tests</h1>

                {/* Available Tests Grid */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Mock Tests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {patterns.map((pattern) => (
                        <div key={pattern._id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 border-l-4 border-indigo-500">
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900">{pattern.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{pattern.description}</p>
                                <div className="mt-4 text-sm text-gray-600 space-y-1">
                                    <p>⏱ Duration: <strong>{pattern.totalDuration} mins</strong></p>
                                    <p>📝 Sections: <strong>{pattern.sections.length}</strong></p>
                                    <p>⚠ Negative Marking: <strong>{pattern.negativeMarking ? 'Yes' : 'No'}</strong></p>
                                </div>
                                <div className="mt-6">
                                    <Link
                                        href={`/dashboard/student/mock-tests/${pattern._id}`}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Start Mock Test
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {patterns.length === 0 && <p className="text-gray-500">No mock tests available at the moment.</p>}
                </div>

                {/* History Section */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Recent Performance</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {history.length === 0 ? (
                            <li className="px-4 py-4 text-center text-gray-500">You haven't taken any tests yet.</li>
                        ) : (
                            history.map((result) => (
                                <li key={result._id}>
                                    <div className="block hover:bg-gray-50">
                                        <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-medium text-indigo-600 truncate">
                                                    {result.pattern?.name || 'Unknown Pattern'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Attempted: {new Date(result.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-gray-900">Score: {result.totalScore}/{result.maxScore}</p>
                                                    <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1
                                                        ${result.readinessLevel === 'Highly Ready' ? 'bg-green-100 text-green-800' :
                                                            result.readinessLevel === 'Moderately Ready' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                        {result.readinessLevel}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/dashboard/student/mock-tests/result/${result._id}`}
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    View Analysis &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
