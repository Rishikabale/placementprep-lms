'use client';

import { useState, useEffect } from 'react';
import API from '../../../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaFileUpload, FaHistory, FaSpinner } from 'react-icons/fa';

export default function ResumeAnalyzerDashboard() {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [textInput, setTextInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await API.get('/resume/history');
                setHistory(res.data);
            } catch (err) {
                console.error('Failed to load history', err);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setTextInput(''); // Clear text if file is uploaded
        }
    };

    const handleAnalyze = async () => {
        if (!file && textInput.trim().length < 50) {
            alert('Please upload a PDF or paste at least 50 characters of your resume.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            if (file) {
                formData.append('resume', file);
            } else {
                formData.append('text', textInput);
            }

            const res = await API.post('/resume/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            router.push(`/dashboard/student/resume-analyzer/result/${res.data._id}`);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Error parsing resume. Please ensure it is a valid format.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Resume Analyzer</h1>
                <p className="mt-2 text-md text-gray-500 max-w-2xl">Upload your CV to see how an ATS (Applicant Tracking System) views it. We'll score your keyword density, structure, and match you with potential career paths.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FaFileUpload className="text-indigo-600" /> New Analysis</h2>
                    
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload PDF Document</label>
                            <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none">
                                <span className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="font-medium text-gray-600">
                                        {file ? file.name : 'Drop files to Attach, or browse'}
                                    </span>
                                </span>
                                <input type="file" name="file_upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                            </label>
                            {file && <button onClick={() => setFile(null)} className="text-xs text-red-500 mt-2 font-medium hover:underline">Remove File</button>}
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">OR PASTE RAW TEXT</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Paste Resume Text</label>
                            <textarea 
                                value={textInput} 
                                onChange={(e) => { setTextInput(e.target.value); setFile(null); }}
                                disabled={file !== null}
                                placeholder={file ? 'Clear file to paste text...' : 'Paste plain text content from your resume here...'}
                                className="w-full h-40 border border-gray-300 rounded-xl p-4 shadow-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 text-sm"
                            ></textarea>
                        </div>
                    </div>

                    <button 
                        onClick={handleAnalyze} 
                        disabled={isSubmitting || (!file && textInput.length < 50)}
                        className="mt-8 w-full flex justify-center items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <><FaSpinner className="animate-spin" /> Analyzing Document...</> : 'Scan My Resume'}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">By analyzing, you agree that your resume structure will be cross-checked against standard formatting heuristic rules.</p>
                </div>

                {/* History Section */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 flex flex-col h-[700px]">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FaHistory className="text-gray-500" /> Previous Scans</h2>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {loadingHistory ? (
                            <div className="flex justify-center items-center h-40">
                                <FaSpinner className="animate-spin text-indigo-500 text-3xl" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 font-medium">No previous resume scans found.</p>
                                <p className="text-xs text-gray-400 mt-1">Upload your resume to start tracking your ATS score!</p>
                            </div>
                        ) : (
                            history.map((record) => (
                                <Link href={`/dashboard/student/resume-analyzer/result/${record._id}`} key={record._id}>
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition group mb-4 cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition truncate max-w-[70%]">
                                                {record.originalFileName || 'Pasted Text'}
                                            </h3>
                                            <span className={`text-sm font-black px-2 py-0.5 rounded ${record.totalScore >= 75 ? 'bg-green-100 text-green-700' : record.totalScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {record.totalScore} / 100
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-4 flex items-center justify-between">
                                            <span>{new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            <span className="font-mono bg-gray-100 rounded px-1.5 py-0.5 border">{record.extractedSkills?.length || 0} skills found</span>
                                        </div>
                                        {/* Tag list preview */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {record.careerFit && record.careerFit[0] && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">
                                                    Top Match: {record.careerFit[0].roleName} ({record.careerFit[0].matchPercentage}%)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
