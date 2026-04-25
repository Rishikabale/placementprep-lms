'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '../../../../../../lib/api';

export default function AIActiveTestSession() {
    const { testId } = useParams();
    const router = useRouter();

    const [test, setTest] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<any>({}); // { questionId: { selectedOption: string, timeSpent: number } }
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer Refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const questionStartTime = useRef<number>(Date.now());

    useEffect(() => {
        if (!testId) return;
        API.get(`/ai-mock/result/${testId}`).then(({ data }) => {
            // If already completed, redirect to result
            if (data.completedAt) {
                router.replace(`/dashboard/student/ai-mock-test/result/${testId}`);
                return;
            }
            setTest(data);
            setTimeLeft(data.duration * 60);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            alert('Failed to load test.');
        });

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [testId, router]);

    // Timer Logic
    useEffect(() => {
        if (!loading && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }, [loading]);

    const handleOptionSelect = (optionText: string) => {
        const qId = test.questions[currentQuestionIndex].questionId._id;

        // Calculate time spent on this question so far
        // Ideally we track deltas. For simplicity, we just won't track per-question time granularly here in MVP without more complex state
        // Let's just store the answer.

        setAnswers({
            ...answers,
            [qId]: {
                selectedOption: optionText,
                timeSpent: 0 // Placeholder or calculate properly
            }
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < test.questions.length - 1) {
            questionStartTime.current = Date.now();
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // Format payload
        const formattedAnswers = Object.keys(answers).map(qId => ({
            questionId: qId,
            selectedOption: answers[qId].selectedOption,
            timeSpent: 10 // Mock value
        }));

        try {
            await API.post('/ai-mock/submit', {
                testId,
                answers: formattedAnswers
            });
            router.replace(`/dashboard/student/ai-mock-test/result/${testId}`);
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 400 && error.response?.data?.message === 'Test already submitted') {
                router.replace(`/dashboard/student/ai-mock-test/result/${testId}`);
            } else {
                alert('Submission failed. Please try again.');
                setIsSubmitting(false);
            }
        }
    };

    if (loading || !test) return <div className="p-10 text-center">Loading AI Test...</div>;

    if (test.questions.length === 0) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-red-600">Test Generation Failed</h2>
                <p className="text-gray-600 mt-2">No questions matched your criteria. Please contact the administrator to seed the question bank.</p>
                <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:underline">Go Back</button>
            </div>
        );
    }

    const currentQ = test.questions[currentQuestionIndex];
    if (!currentQ || !currentQ.questionId) {
        return <div className="p-10 text-center">Error loading question.</div>;
    }
    const qData = currentQ.questionId; // Populated question data

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{test.type}</h2>
                    <span className="text-sm text-gray-500">Q {currentQuestionIndex + 1} of {test.questions.length}</span>
                </div>
                <div className={`text-xl font-mono font-bold px-4 py-2 rounded ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-800'}`}>
                    ⏱ {formatTime(timeLeft)}
                </div>
                <button
                    onClick={() => { if (confirm('Finish test?')) handleSubmit(); }}
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded font-medium ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </button>
            </div>

            {/* Question Area */}
            <div className="flex-1 max-w-4xl mx-auto w-full p-6">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-start mb-6">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
                            {qData.category}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded uppercase ${qData.difficulty === 'Hard' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {qData.difficulty}
                        </span>
                    </div>

                    <h3 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                        {qData.text}
                    </h3>

                    <div className="space-y-4">
                        {qData.options.map((opt: any, idx: number) => {
                            const isSelected = answers[qData._id]?.selectedOption === opt.text;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(opt.text)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="font-bold mr-3 text-gray-400">{String.fromCharCode(65 + idx)}.</span>
                                    {opt.text}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        ← Previous
                    </button>
                    {currentQuestionIndex < test.questions.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        >
                            Next Question →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'text-white bg-green-600 hover:bg-green-700'}`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
