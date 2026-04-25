'use client';

import { useEffect, useState, use } from 'react';
import API from '../../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function MockTestEnvironment({ params }: { params: Promise<{ patternId: string }> }) {
    const { patternId } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);

    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<any>({}); // { questionId: selectedOption }
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [startTime, setStartTime] = useState(Date.now());

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const { data } = await API.post('/mock-tests/generate', { patternId });
                setTestData(data.pattern);
                setQuestions(data.questions);
                setTimeLeft(data.pattern.totalDuration * 60);
                setStartTime(Date.now());
            } catch (error) {
                console.error(error);
                alert('Failed to start test');
                router.push('/dashboard/student/mock-tests');
            } finally {
                setLoading(false);
            }
        };
        fetchTest(); // Intentional: data fetching logic is inside useEffect, not a double call
    }, [patternId, router]);

    // Timer Logic
    useEffect(() => {
        if (loading || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, timeLeft]);

    const handleAnswer = (option: string) => {
        const currentQ = questions[currentQuestionIndex];
        setAnswers({
            ...answers,
            [currentQ._id]: option
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSubmit = async () => {
        try {
            // Calculate time taken
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);

            // Format answers for backend
            const formattedAnswers = Object.keys(answers).map(qId => ({
                questionId: qId,
                selectedOption: answers[qId],
                timeSpent: 0 // We aren't tracking per-q time strictly yet
            }));

            const { data } = await API.post('/mock-tests/submit', {
                patternId,
                answers: formattedAnswers,
                timeTaken
            });

            router.push(`/dashboard/student/mock-tests/result/${data._id}`);
        } catch (error) {
            console.error(error);
            alert('Error submitting test');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-xl">Generating Test Environment...</div>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow py-4 px-6 fixed w-full top-0 z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{testData.name} Mock Test</h1>
                    <p className="text-sm text-gray-500">Section: {currentQuestion.sectionName} ({currentQuestion.category})</p>
                </div>
                <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-indigo-600'}`}>
                    {formatTime(timeLeft)}
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    Submit Test
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 mt-20 max-w-4xl w-full mx-auto p-4 flex flex-col">
                <div className="bg-white shadow sm:rounded-lg overflow-hidden flex-1 flex flex-col">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-2">
                        <div
                            className="bg-indigo-600 h-2 transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>

                    {/* Question Area */}
                    <div className="p-8 flex-1 overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <span className="text-sm text-gray-500">
                                Weightage: {currentQuestion.weightage} marks
                            </span>
                        </div>

                        <h2 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                            {currentQuestion.text}
                        </h2>

                        <div className="space-y-4">
                            {currentQuestion.options.map((opt: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(opt.text)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[currentQuestion._id] === opt.text
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="font-semibold mr-3">{String.fromCharCode(65 + idx)}.</span>
                                    {opt.text}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Navigation */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        <div className="flex gap-2 overflow-x-auto max-w-md px-2 hidden sm:flex">
                            {/* Quick nav dots could go here */}
                            {questions.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-2 w-2 rounded-full ${idx === currentQuestionIndex ? 'bg-indigo-600' : answers[questions[idx]._id] ? 'bg-green-400' : 'bg-gray-300'}`}
                                />
                            ))}
                        </div>

                        <button
                            disabled={currentQuestionIndex === questions.length - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Next Question
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
