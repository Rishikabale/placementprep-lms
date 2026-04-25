'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '../../../../../lib/api';

export default function ConfigureTestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        type: 'Full Mock',
        difficulty: 'Adaptive',
        duration: 30
    });

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const { data } = await API.post('/ai-mock/generate', config);
            router.push(`/dashboard/student/ai-mock-test/session/${data._id}`);
        } catch (error) {
            console.error(error);
            const err = error as any;
            const msg = err.response?.data?.message || err.message || 'Failed to generate test';
            alert(`Error: ${msg}`);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Configure Your AI Test </h1>
                <p className="mt-2 text-gray-600">Customize the test parameters and let AI build it for you.</p>
            </div>

            <div className="bg-white shadow-xl rounded-lg p-8">
                {/* 1. Test Type */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Test Focus</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Full Mock', 'Aptitude Only', 'Coding Only'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setConfig({ ...config, type })}
                                className={`py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${config.type === type
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Difficulty */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty Level</label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {['Easy', 'Medium', 'Hard', 'Adaptive'].map((diff) => (
                            <button
                                key={diff}
                                onClick={() => setConfig({ ...config, difficulty: diff })}
                                className={`py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${config.difficulty === diff
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                                    }`}
                            >
                                {diff} {diff === 'Adaptive' && '✨'}
                            </button>
                        ))}
                    </div>
                    {config.difficulty === 'Adaptive' && (
                        <p className="mt-2 text-xs text-indigo-600">
                            ℹ AI will adjust difficulty based on your previous performance.
                        </p>
                    )}
                </div>

                {/* 3. Duration */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Duration</label>
                    <select
                        value={config.duration}
                        onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                        className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value={15}>15 Minutes (Sprint)</option>
                        <option value={30}>30 Minutes (Standard)</option>
                        <option value={60}>60 Minutes (Marathon)</option>
                    </select>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? 'Generating Test Blueprint...' : 'Start Mock Test'}
                </button>
            </div>
        </div>
    );
}
