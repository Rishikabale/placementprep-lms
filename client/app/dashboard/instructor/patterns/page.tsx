'use client';

import { useEffect, useState } from 'react';
import API from '../../../../lib/api';
import Link from 'next/link';

export default function PatternsPage() {
    const [patterns, setPatterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('mine');

    useEffect(() => {
        fetchPatterns();
    }, [activeTab]);

    const fetchPatterns = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/company-patterns?filter=' + activeTab);
            setPatterns(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClone = async (id: string) => {
        try {
            await API.post(`/company-patterns/${id}/clone`);
            alert('Pattern cloned successfully!');
            setActiveTab('mine');
        } catch (error) {
            console.error(error);
            alert('Failed to clone pattern');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this pattern?')) return;
        try {
            await API.delete(`/company-patterns/${id}`);
            fetchPatterns();
        } catch (error) {
            console.error(error);
            alert('Failed to delete pattern');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Company Test Patterns</h1>
                    <Link
                        href="/dashboard/instructor/patterns/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        + Create New Pattern
                    </Link>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {['mine', 'global', 'community'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    activeTab === tab
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                            >
                                {tab === 'mine' ? 'My Patterns' : tab === 'global' ? 'Global Patterns' : 'Community Patterns'}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {patterns.length === 0 ? (
                            <li className="px-4 py-4 text-center text-gray-500">No patterns found. Create one to get started.</li>
                        ) : (
                            patterns.map((pattern) => (
                                <li key={pattern._id}>
                                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg leading-6 font-medium text-indigo-600">{pattern.name}</h3>
                                            <p className="mt-1 max-w-2xl text-sm text-gray-500">{pattern.description}</p>
                                            <div className="mt-2 text-sm text-gray-700">
                                                <span className="font-semibold">Duration:</span> {pattern.totalDuration} minutes |
                                                <span className="ml-2 font-semibold">Total Sections:</span> {pattern.sections.length}
                                            </div>
                                        </div>
                                        <div className="flex space-x-4">
                                            {activeTab === 'mine' ? (
                                                <button
                                                    onClick={() => handleDelete(pattern._id)}
                                                    className="text-red-600 hover:text-red-900 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleClone(pattern._id)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                >
                                                    Clone
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Section Breakdown Preview */}
                                    <div className="px-4 pb-4 sm:px-6">
                                        <div className="flex flex-wrap gap-2">
                                            {pattern.sections.map((sec: any, idx: number) => (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {sec.sectionName}: {sec.questionCount} Qs ({sec.category})
                                                </span>
                                            ))}
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
