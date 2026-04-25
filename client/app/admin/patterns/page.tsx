'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';
import Link from 'next/link';

export default function AdminPatternsPage() {
    const [patterns, setPatterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        fetchPatterns();
    }, []);

    const fetchPatterns = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/company-patterns?filter=global');
            setPatterns(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        if (!confirm('Are you sure you want to seed default global patterns? This will not duplicate existing ones.')) return;
        setIsSeeding(true);
        try {
            await API.post('/company-patterns/seed');
            alert('Global patterns seeded successfully!');
            fetchPatterns();
        } catch (error) {
            console.error(error);
            alert('Failed to seed patterns');
        } finally {
            setIsSeeding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this global pattern?')) return;
        try {
            await API.delete(`/company-patterns/${id}`);
            fetchPatterns();
        } catch (error) {
            console.error(error);
            alert('Failed to delete global pattern');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Global Company Patterns</h1>
                    <div className="flex gap-4">
                        <Link
                            href="/admin/patterns/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            + Create Global Pattern
                        </Link>
                        <button
                            onClick={handleSeed}
                            disabled={isSeeding}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                        >
                            {isSeeding ? 'Seeding...' : '🌱 Seed Default Patterns'}
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {patterns.length === 0 ? (
                            <li className="px-4 py-4 text-center text-gray-500">No global patterns found. Click Seed to populate them.</li>
                        ) : (
                            patterns.map((pattern) => (
                                <li key={pattern._id}>
                                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg leading-6 font-medium text-green-600">{pattern.name}</h3>
                                            <p className="mt-1 max-w-2xl text-sm text-gray-500">{pattern.description}</p>
                                            <div className="mt-2 text-sm text-gray-700">
                                                <span className="font-semibold">Duration:</span> {pattern.totalDuration} minutes |
                                                <span className="ml-2 font-semibold">Total Sections:</span> {pattern.sections.length}
                                            </div>
                                        </div>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => handleDelete(pattern._id)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Delete
                                            </button>
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
