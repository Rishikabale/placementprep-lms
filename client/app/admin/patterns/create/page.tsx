'use client';

import { useState } from 'react';
import API from '../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function CreateGlobalPatternPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        totalDuration: 60,
        negativeMarking: false,
        negativeMarkValue: 0.25,
    });

    const [sections, setSections] = useState<any[]>([
        { sectionName: 'Quantitative Aptitude', questionCount: 10, category: 'Quant', weightage: 1, difficulty: 'Medium' }
    ]);

    const handleAddSection = () => {
        setSections([...sections, { sectionName: '', questionCount: 10, category: 'Quant', weightage: 1, difficulty: 'Medium' }]);
    };

    const handleSectionChange = (index: number, field: string, value: any) => {
        const newSections = [...sections];
        newSections[index][field] = value;
        setSections(newSections);
    };

    const handleRemoveSection = (index: number) => {
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.post('/company-patterns', {
                ...formData,
                isGlobal: true,   // Force it to be a global pattern
                isPublic: true,   // Global patterns are public to all
                sections
            });
            alert('Global Pattern created successfully!');
            router.push('/admin/patterns');
        } catch (error) {
            console.error(error);
            alert('Failed to create global pattern');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Global Pattern</h1>

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-medium text-gray-700">Company / Pattern Name</label>
                        </div>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g. Cognizant GenC"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Provide details about the test structure..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Total Duration (Minutes)</label>
                            <input
                                type="number"
                                required
                                value={formData.totalDuration}
                                onChange={(e) => setFormData({ ...formData, totalDuration: Number(e.target.value) })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.negativeMarking}
                                onChange={(e) => setFormData({ ...formData, negativeMarking: e.target.checked })}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">Enable Negative Marking</label>
                        </div>
                        {formData.negativeMarking && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deduction Value</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.negativeMarkValue}
                                    onChange={(e) => setFormData({ ...formData, negativeMarkValue: Number(e.target.value) })}
                                    className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-medium text-gray-900">Sections</h2>
                        <button
                            type="button"
                            onClick={handleAddSection}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                            + Add Section
                        </button>
                    </div>

                    <div className="space-y-4">
                        {sections.map((section, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSection(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500">Section Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={section.sectionName}
                                            onChange={(e) => handleSectionChange(index, 'sectionName', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Category</label>
                                        <select
                                            value={section.category}
                                            onChange={(e) => handleSectionChange(index, 'category', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:text-sm"
                                        >
                                            <option value="Quant">Quant</option>
                                            <option value="Logical">Logical</option>
                                            <option value="Verbal">Verbal</option>
                                            <option value="Coding">Coding</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Q Count</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={section.questionCount}
                                            onChange={(e) => handleSectionChange(index, 'questionCount', Number(e.target.value))}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Weightage</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={section.weightage}
                                            onChange={(e) => handleSectionChange(index, 'weightage', Number(e.target.value))}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
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
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Save Global Pattern
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
