'use client';

import { useEffect, useState, use } from 'react';
import API from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
    const { quizId } = use(params);
    const [quiz, setQuiz] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await API.get(`/quizzes/${quizId}`);
                setQuiz(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleOptionSelect = (questionId: string, optionText: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionText }));
    };

    const handleSubmit = async () => {
        try {
            const { data } = await API.post(`/quizzes/${quizId}/submit`, {
                quizId,
                answers
            });
            setResult(data);
        } catch (error) {
            console.error(error);
        }
    };

    if (!quiz) return <div>Loading Quiz...</div>;

    if (result) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 text-center">
                <div className={`p-8 rounded-lg shadow-lg ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                    <h2 className="text-3xl font-bold mb-4">{result.passed ? 'Congratulations! 🎉' : 'Keep Practicing! 💪'}</h2>
                    <p className="text-xl mb-2">You scored: <span className="font-bold">{result.percentage.toFixed(0)}%</span></p>
                    <p className="text-gray-600 mb-6">Required to pass: {quiz.passingScore}%</p>

                    <button
                        onClick={() => router.back()}
                        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                    >
                        Back to Course
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
                <p className="text-gray-500 mb-6">{quiz.description}</p>

                <div className="space-y-8">
                    {quiz.questions.map((q: any, idx: number) => (
                        <div key={q._id} className="border-b border-gray-200 pb-6 last:border-0">
                            <p className="text-lg font-medium mb-4">{idx + 1}. {q.text}</p>
                            <div className="space-y-2">
                                {q.options.map((opt: any, oIdx: number) => (
                                    <label key={oIdx} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name={q._id}
                                            value={opt.text}
                                            checked={answers[q._id] === opt.text}
                                            onChange={() => handleOptionSelect(q._id, opt.text)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <span className="text-gray-700">{opt.text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-indigo-600 text-white py-3 rounded-md font-bold hover:bg-indigo-700 transition"
                    >
                        Submit Quiz
                    </button>
                </div>
            </div>
        </div>
    );
}
