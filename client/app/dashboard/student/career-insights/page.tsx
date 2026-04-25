'use client';

import { useEffect, useState } from 'react';
import API from '../../../../lib/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function CareerInsightsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const { data } = await API.get('/career/recommendation');
            setData(data);
            setError('');
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 400) {
                setError('Please take at least one Mock Test to unlock AI Career Insights.');
            } else {
                setError('Failed to load career insights.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculate = async () => {
        setLoading(true);
        try {
            const { data } = await API.post('/career/recalculate');
            setData(data);
            setError('');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Analyzing Profile...</div>;
    if (error) return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">⚠️</div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        </div>
    );
    if (!data) return <div>No data found.</div>;

    // Prepare Radar Data from User Metrics
    const radarData = [
        { subject: 'Coding', A: data.metrics.averageCoding, fullMark: 100 },
        { subject: 'Quant', A: data.metrics.averageQuant, fullMark: 100 },
        { subject: 'Logical', A: data.metrics.averageLogical, fullMark: 100 },
        { subject: 'Verbal', A: data.metrics.averageVerbal, fullMark: 100 },
    ];

    const topRole = data.recommendations[0];

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">AI Career Intelligence</h1>
                <button
                    onClick={handleRecalculate}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    🔄 Recalculate
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Radar Chart */}
                <div className="bg-white p-6 rounded-lg shadow lg:col-span-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Your Skill Profile</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="My Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Tooltip />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Top Strength: <span className="font-bold text-indigo-600">
                            {radarData.reduce((prev, current) => (prev.A > current.A) ? prev : current).subject}
                        </span>
                    </div>
                </div>

                {/* Top Recommendation */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg shadow lg:col-span-2 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 font-medium mb-1">Top Recommended Role</p>
                            <h2 className="text-4xl font-bold">{topRole.roleName}</h2>
                            <p className="mt-2 text-lg opacity-90">{topRole.reason}</p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-full">
                            <span className="text-3xl font-bold">{topRole.matchPercentage}%</span> Fit
                        </div>
                    </div>

                    {topRole.missingSkills.length > 0 && (
                        <div className="mt-8 bg-black/20 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">⚠ Skill Gaps to Close:</h4>
                            <ul className="space-y-2">
                                {topRole.missingSkills.map((gap: any, idx: number) => (
                                    <li key={idx} className="flex justify-between items-center text-sm">
                                        <span>improve <strong>{gap.skill}</strong> by {gap.gap}%</span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Current: {gap.current}% / Target: {gap.required}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Other Recommendations */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Alternative Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.recommendations.slice(1).map((rec: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{rec.roleName}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${rec.matchPercentage >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {rec.matchPercentage}% Match
                            </span>
                        </div>
                        <p className="text-gray-600 mb-4">{rec.reason}</p>
                        {rec.missingSkills.length > 0 ? (
                            <div className="text-sm text-gray-500">
                                <p>Focus areas: {rec.missingSkills.map((m: any) => m.skill).join(', ')}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-green-600 font-medium">You are highly qualified for this role!</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
