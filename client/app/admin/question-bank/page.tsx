'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';

export default function AdminQuestionBankPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // Filters
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [pageConfig, setPageConfig] = useState({ page: 1, total: 0, pages: 1 });

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const res = await API.get('/admin/questions', { params: { category, search, page: pageConfig.page } });
            setQuestions(res.data.questions);
            setPageConfig(prev => ({ ...prev, total: res.data.total, pages: res.data.pages }));
        } catch (error) {
            console.error('Failed to fetch questions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [category, pageConfig.page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPageConfig(prev => ({ ...prev, page: 1 }));
        fetchQuestions();
    };

    const deleteQuestion = async (id: string) => {
        if (!confirm('Delete this question?')) return;
        try {
            await API.delete(`/admin/questions/${id}`);
            fetchQuestions();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                setUploading(true);
                const fileContent = event.target?.result as string;
                const parsedQuestions = JSON.parse(fileContent);
                
                const res = await API.post('/admin/questions/bulk', { questions: parsedQuestions });
                alert(res.data.message);
                fetchQuestions();
            } catch (error: any) {
                alert('Parsing or upload error: ' + (error.response?.data?.message || 'Invalid JSON format. Check schema.'));
            } finally {
                setUploading(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Global Question Bank</h1>
                
                <div className="flex items-center space-x-3">
                    <label className={`cursor-pointer px-4 py-2 ${uploading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm font-medium rounded-md shadow-sm transition-colors`}>
                        {uploading ? 'Uploading...' : 'Bulk Upload (JSON)'}
                        <input type="file" accept=".json" className="hidden" disabled={uploading} onChange={handleFileUpload} />
                    </label>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="Search question text..." 
                        className="form-input flex-1 text-sm border-slate-300 rounded-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-700">Find</button>
                    {search && <button type="button" onClick={() => { setSearch(''); setTimeout(fetchQuestions, 0); }} className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-md text-sm border border-slate-200">Clear</button>}
                </form>
                <div className="flex items-center space-x-2">
                    <select 
                        className="form-select text-sm border-slate-300 rounded-md"
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setPageConfig(p => ({...p, page: 1})); }}
                    >
                        <option value="">All Categories</option>
                        <option value="Quant">Quantitative</option>
                        <option value="Logical">Logical</option>
                        <option value="Verbal">Verbal</option>
                        <option value="Coding">Coding</option>
                    </select>
                </div>
            </div>

            {/* Questions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Question snippet</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cat & Diff</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading bank...</td></tr>
                            ) : questions.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No questions found. Add some or bulk upload.</td></tr>
                            ) : (
                                questions.map((q) => (
                                    <tr key={q._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm text-slate-900 max-w-md">
                                            <div className="line-clamp-2">{q.text}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-1">{q.type}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-700">{q.category}</div>
                                            <div className="text-xs text-slate-500">{q.difficulty}</div>
                                        </td>
                                        <td className="px-4 py-4 max-w-xs">
                                            <div className="flex flex-wrap gap-1">
                                                {q.tags?.map((t: string) => <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded uppercase">{t}</span>)}
                                                {q.companyTags?.map((c: string) => <span key={c} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-semibold rounded uppercase">{c}</span>)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => deleteQuestion(q._id)} 
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Placeholder */}
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between sm:px-6">
                    <div className="text-sm text-slate-500">
                        Total: <span className="font-semibold">{pageConfig.total}</span> questions
                    </div>
                    <div className="flex space-x-2">
                        <button disabled={pageConfig.page <= 1} onClick={() => setPageConfig(p => ({...p, page: p.page - 1}))} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-100 transition-colors bg-white">Prev</button>
                        <span className="px-3 py-1 text-sm text-slate-700">Page {pageConfig.page} of {pageConfig.pages || 1}</span>
                        <button disabled={pageConfig.page >= pageConfig.pages} onClick={() => setPageConfig(p => ({...p, page: p.page + 1}))} className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 hover:bg-slate-100 transition-colors bg-white">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
