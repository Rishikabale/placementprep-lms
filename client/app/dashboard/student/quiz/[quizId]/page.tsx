'use client';

import { useEffect, useState, use } from 'react';
import API from '../../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function StudentQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
    const { quizId } = use(params);
    const router = useRouter();

    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await API.get(`/quizzes/${quizId}`);
                setQuiz(data);
            } catch (error) {
                console.error(error);
                alert("Failed to load quiz.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleOptionSelect = (questionId: string, optionText: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionText
        }));
    };

    const handleSubmit = async () => {
        if (!confirm("Are you sure you want to submit?")) return;

        setSubmitting(true);
        try {
            const { data } = await API.post(`/quizzes/${quizId}/submit`, {
                quizId,
                answers
            });
            setResult(data); // { score, percentage, passed }
        } catch (error) {
            console.error(error);
            alert("Failed to submit quiz.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!quiz) return <div className="p-10 text-center">Quiz not found</div>;

    if (result) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <span className="text-4xl">{result.passed ? '🏆' : '⚠️'}</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
                    </h2>
                    <p className="text-gray-500 mb-8">
                        You scored <span className="font-bold text-gray-900">{Math.round(result.percentage)}%</span> on this quiz.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Score</p>
                            <p className="text-xl font-bold text-indigo-600">{result.score} / {quiz.questions.length}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                            <p className={`text-xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {result.passed ? 'PASSED' : 'FAILED'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="w-full btn-primary py-3"
                    >
                        Return to Course
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
            <div className="mb-8">
                <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-900 mb-4">&larr; Back</button>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="mt-2 text-gray-600">{quiz.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">⏱ {quiz.duration} Minutes</span>
                    <span className="flex items-center gap-1">📝 {quiz.questions.length} Questions</span>
                    <span className="flex items-center gap-1">🎯 Pass: {quiz.passingScore}%</span>
                </div>
            </div>

            <div className="space-y-8">
                {quiz.questions.map((q: any, idx: number) => (
                    <div key={q._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                <span className="text-gray-400 mr-2">#{idx + 1}</span>
                                {q.text}
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            {q.options.map((opt: any) => (
                                <label
                                    key={opt._id}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${answers[q._id] === opt.text
                                            ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={q._id}
                                        value={opt.text}
                                        checked={answers[q._id] === opt.text}
                                        onChange={() => handleOptionSelect(q._id, opt.text)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="ml-3 text-gray-700">{opt.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                    className={`btn-primary px-8 py-3 text-lg ${Object.keys(answers).length < quiz.questions.length ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
            </div>
        </div>
    );
}
