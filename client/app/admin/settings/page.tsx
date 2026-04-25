'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        mockTestDurationLimit: 120,
        globalNegativeMarkingRule: false,
        aptitudeScoreWeight: 0.4,
        codingScoreWeight: 0.6,
        readinessThreshold: 70
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await API.get('/admin/settings');
                setSettings({
                    mockTestDurationLimit: res.data.mockTestDurationLimit,
                    globalNegativeMarkingRule: res.data.globalNegativeMarkingRule,
                    aptitudeScoreWeight: res.data.aptitudeScoreWeight,
                    codingScoreWeight: res.data.codingScoreWeight,
                    readinessThreshold: res.data.readinessThreshold
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await API.put('/admin/settings', settings);
            alert('System Configs updated successfully and propagated.');
        } catch (error) {
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading system configurations...</div>;

    return (
        <div className="max-w-3xl space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Core System Configurations</h1>
            <p className="text-sm text-slate-500">Changes made here take effect globally immediately across all AI systems and mock environments.</p>

            <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-8">
                
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Global Testing Engine</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Max Mock Test Duration (mins)</label>
                            <input 
                                type="number" 
                                name="mockTestDurationLimit"
                                className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                                value={settings.mockTestDurationLimit}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <input 
                                type="checkbox" 
                                id="globalNegativeMarkingRule"
                                name="globalNegativeMarkingRule"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={settings.globalNegativeMarkingRule}
                                onChange={handleChange}
                            />
                            <label htmlFor="globalNegativeMarkingRule" className="ml-2 block text-sm text-slate-900 font-medium font-mono">Enforce Global Default Negative Penalty System</label>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Readiness Weighting Logic</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Aptitude Score Weight (0.0 - 1.0)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                max="1.0"
                                name="aptitudeScoreWeight"
                                className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                                value={settings.aptitudeScoreWeight}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Coding Score Weight (0.0 - 1.0)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                max="1.0"
                                name="codingScoreWeight"
                                className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                                value={settings.codingScoreWeight}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Placement Readiness Threshold (Score / 100)</label>
                            <input 
                                type="number" 
                                name="readinessThreshold"
                                className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                                value={settings.readinessThreshold}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-slate-400 mt-1">Students dropping below this average will trigger 'At Risk' alerts on the dashboard.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors uppercase tracking-wider text-sm disabled:opacity-50"
                    >
                        {saving ? 'Overriding System Variables...' : 'Save & Overwrite Global Config'}
                    </button>
                </div>
            </form>
        </div>
    );
}
