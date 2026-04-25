'use strict';
'use client';

import { useState, Suspense } from 'react';
import API from '../../../../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

function CreateQuizContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const videoId = searchParams.get('videoId');
    const courseId = searchParams.get('courseId');

    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        duration: 10,
        passingScore: 60,
        type: 'VIDEO_QUIZ'
    });

    const [questions, setQuestions] = useState<any[]>([
        { text: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }], type: 'MCQ' }
    ]);

    const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setQuizData({ ...quizData, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex][field] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }], type: 'MCQ' }]);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const addOption = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push({ text: '', isCorrect: false });
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate correct options
            for (let i = 0; i < questions.length; i++) {
                const hasCorrect = questions[i].options.some((o: any) => o.isCorrect);
                if (!hasCorrect) {
                    alert(`Question ${i + 1} must have at least one correct option.`);
                    return;
                }
            }

            await API.post('/quizzes', {
                ...quizData,
                questions,
                relatedVideo: videoId
            });

            alert('Quiz created successfully!');
            router.push(`/dashboard/instructor/courses/${courseId}`);
        } catch (error) {
            console.error(error);
            alert('Failed to create quiz');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Quiz associated with Video</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Quiz Details */}
                <div className="bg-white p-6 shadow sm:rounded-lg space-y-6">
                    <h2 className="text-xl font-semibold">Quiz Details</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" required value={quizData.title} onChange={handleQuizChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" rows={3} value={quizData.description} onChange={handleQuizChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                            <input type="number" name="duration" required value={quizData.duration} onChange={handleQuizChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
                            <input type="number" name="passingScore" required value={quizData.passingScore} onChange={handleQuizChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Questions</h2>
                        <button type="button" onClick={addQuestion} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200">
                            + Add Question
                        </button>
                    </div>

                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white p-6 shadow sm:rounded-lg border border-gray-200 relative">
                            <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                                Remove
                            </button>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Question {qIndex + 1}</label>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Enter question text"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Options</label>
                                    {q.options.map((option: any, oIndex: number) => (
                                        <div key={oIndex} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                                                required
                                                className="flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder={`Option ${oIndex + 1}`}
                                            />
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={option.isCorrect}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, 'isCorrect', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-gray-500">Correct</span>
                                            </div>
                                            {q.options.length > 2 && (
                                                <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-gray-400 hover:text-red-500">
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOption(qIndex)} className="text-sm text-indigo-600 hover:text-indigo-900">
                                        + Add Option
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-lg font-medium"
                    >
                        Create Quiz
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function CreateQuizPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateQuizContent />
        </Suspense>
    );
}
