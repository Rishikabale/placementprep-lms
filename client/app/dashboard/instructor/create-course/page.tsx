'use client';

import { useState } from 'react';
import API from '../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function CreateCourse() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        isPublished: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Convert tags string to array
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            await API.post('/courses', {
                ...formData,
                tags: tagsArray
            });

            router.push('/dashboard/instructor');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Course</h1>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-lg">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Course Title
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="e.g. Advanced React Patterns"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <div className="mt-1">
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="Detailed description of what students will learn..."
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                        Tags (comma separated)
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="tags"
                            id="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="React, Frontend, Advanced"
                        />
                    </div>
                </div>

                <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="isPublished"
                            name="isPublished"
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={handleCheckboxChange}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="isPublished" className="font-medium text-gray-700">
                            Publish immediately
                        </label>
                        <p className="text-gray-500">
                            If unchecked, the course will be saved as a draft.
                        </p>
                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
