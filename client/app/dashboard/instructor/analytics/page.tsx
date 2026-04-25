'use client';

import { useEffect, useState } from 'react';
import API from '../../../../lib/api';
import dynamic from 'next/dynamic';

// Dynamically import charts with SSR disabled to prevent hydration errors and chunk load issues
const AnalyticsCharts = dynamic(() => import('./AnalyticsCharts'), { ssr: false });

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await API.get('/analytics/instructor');
                setAnalytics(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

    const { summary, weakTopics } = analytics || { summary: {}, weakTopics: [] };

    // Data for charts
    const weakTopicsData = weakTopics.map((t: any) => ({
        name: t.category,
        accuracy: Math.round(t.accuracy)
    }));

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Performance Analytics</h1>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-indigo-600">{summary.totalStudents}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Mock Tests</p>
                    <p className="text-2xl font-bold text-blue-600">{summary.totalTestsTaken}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Avg Global Score</p>
                    <p className="text-2xl font-bold text-green-600">{summary.avgScore}%</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Active Courses</p>
                    <p className="text-2xl font-bold text-purple-600">{summary.totalCourses}</p>
                </div>
            </div>

            {/* Client-Side Only Charts */}
            <AnalyticsCharts weakTopicsData={weakTopicsData} />
        </div>
    );
}
