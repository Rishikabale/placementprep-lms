'use client';

import { useEffect, useState } from 'react';
import API from '../../../../lib/api';

export default function QuestionBankPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        category: 'Quant',
        difficulty: 'Medium',
        type: 'MCQ'
    });

    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);

    useEffect(() => {
        fetchQuestions(page);
    }, [page]);

    const fetchQuestions = async (currentPage = 1) => {
        try {
            setLoading(true);
            const { data } = await API.get(`/questions?page=${currentPage}&limit=20`);
            setQuestions(data.questions);
            setTotalPages(data.totalPages);
            setTotalQuestions(data.totalQuestions);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        setUploading(true);
        try {
            const res = await API.post('/questions/bulk-upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(res.data.message);
            fetchQuestions();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to upload CSV');
        } finally {
            setUploading(false);
            e.target.value = null; // reset
        }
    };

    const downloadTemplate = () => {
        const headers = "QuestionText,Option1,Option2,Option3,Option4,CorrectOption,Category,Difficulty\n";
        const sample = "What is the capital of France?,Berlin,London,Paris,Rome,Option3,Verbal,Easy\n";
        const blob = new Blob([headers + sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'question_template.csv';
        a.click();
    };

    const handleCreate = async (e: any) => {
        e.preventDefault();
        try {
            await API.post('/questions', formData);
            setShowAddModal(false);
            fetchQuestions();
            setFormData({
                text: '',
                options: ['', '', '', ''],
                correctAnswer: '',
                category: 'Quant',
                difficulty: 'Medium',
                type: 'MCQ'
            });
        } catch (error) {
            console.error(error);
            alert('Failed to create question');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Question Bank...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
                <div className="flex gap-4">
                    <button onClick={downloadTemplate} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium self-center underline mr-2">
                        Download CSV Template
                    </button>
                    <div>
                        <input type="file" accept=".csv" id="csv-upload" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        <label htmlFor="csv-upload" className={`cursor-pointer text-white px-4 py-2 rounded-md transition-colors inline-block ${uploading ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                            {uploading ? 'Uploading...' : 'Upload CSV'}
                        </label>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        + Add Question
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {questions.length === 0 ? (
                        <li className="p-8 text-center text-gray-500">
                            No questions found. Add some to get started!
                        </li>
                    ) : (
                        questions.map((q) => (
                            <li key={q._id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                                q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {q.difficulty}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {q.category}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{q.text}</p>
                                        <p className="text-xs text-gray-500 mt-1">Answer: {q.correctAnswer}</p>
                                    </div>
                                    <div className="flex items-center">
                                        {/* Edit/Delete placeholders */}
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
                
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> ({totalQuestions} total questions)
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Add New Question</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                                <textarea
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Quant</option>
                                        <option>Logical</option>
                                        <option>Verbal</option>
                                        <option>Coding</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                {formData.options.map((opt, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        required
                                        placeholder={`Option ${idx + 1}`}
                                        className="mb-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...formData.options];
                                            newOpts[idx] = e.target.value;
                                            setFormData({ ...formData, options: newOpts });
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Correct Answer (Exact Match)</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                    value={formData.correctAnswer}
                                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Save Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
