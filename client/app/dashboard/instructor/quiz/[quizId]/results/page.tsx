'use strict';
'use client';

import { useEffect, useState, use } from 'react';
import API from '../../../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function QuizResultsPage({ params }: { params: Promise<{ quizId: string }> }) {
    const { quizId } = use(params);
    const [results, setResults] = useState<any[]>([]);
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Quiz Details
                const quizRes = await API.get(`/quizzes/${quizId}`);
                setQuiz(quizRes.data);

                // Fetch Results
                const resultsRes = await API.get(`/quizzes/${quizId}/results`);
                setResults(resultsRes.data);
            } catch (error) {
                console.error(error);
                alert("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        if (quizId) {
            fetchData();
        }
    }, [quizId]);

    if (loading) return <div>Loading...</div>;
    if (!quiz) return <div>Quiz not found</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quiz Results: {quiz.title}</h1>
                    <p className="mt-2 text-sm text-gray-600">Passing Score: {quiz.passingScore}%</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                    Back
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Attempts
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Best Score
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {results.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    No students have attempted this quiz yet.
                                </td>
                            </tr>
                        ) : (
                            results.map((record, idx) => {
                                // Calculate best score safely
                                if (!record.attempts || record.attempts.length === 0) {
                                    return null; // Should not happen if filtered correctly, but safe
                                }

                                const bestAttempt = record.attempts.reduce((prev: any, current: any) =>
                                    (prev.score > current.score) ? prev : current
                                    , record.attempts[0]); // Provide initial value

                                return (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{record.student?.name || 'Unknown'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{record.student?.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{record.attempts.length}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{Math.round(bestAttempt.score)}%</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bestAttempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {bestAttempt.passed ? 'Passed' : 'Failed'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
