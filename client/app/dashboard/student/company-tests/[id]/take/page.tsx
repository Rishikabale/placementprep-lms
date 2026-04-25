'use client';
import { useEffect, useState, useRef } from 'react';
import API from '../../../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function TakeCompanyTest() {
    const params = useParams();
    const router = useRouter();
    const [testData, setTestData] = useState<any>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    
    // Anti-cheat mechanics
    const [tabSwitches, setTabSwitches] = useState(0);
    const MAX_TAB_SWITCHES = 3;
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        isSubmittingRef.current = isSubmitting;
    }, [isSubmitting]);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await API.get(`/company-test/${params.id}/start`);
                setTestData(res.data);
                setTimeLeft(res.data.pattern.totalDuration * 60);
                setStartTime(Date.now());
            } catch (err: any) {
                console.error(err);
                alert(err.response?.data?.message || "Failed to load test parameters.");
                router.push('/dashboard/student/company-tests');
            }
        };
        fetchTest();
    }, [params.id, router]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft <= 0 && testData && !isSubmittingRef.current) {
            handleSubmit();
            return;
        }
        if (testData && !isSubmittingRef.current) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, testData]);

    // Anti-Cheat (Tab Switching) Logic
    useEffect(() => {
        if (!testData || isSubmittingRef.current) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabSwitches(prev => {
                    const newCount = prev + 1;
                    if (newCount >= MAX_TAB_SWITCHES) {
                        alert(`Critical Warning: You have switched tabs ${newCount} times! The test is now being automatically submitted to prevent cheating.`);
                        // Ensure we submit with current state
                        setTimeout(() => handleSubmit(), 0);
                    } else {
                        alert(`Warning: Tab switching detected! (${newCount}/${MAX_TAB_SWITCHES} allowed).\nIf you reach ${MAX_TAB_SWITCHES} tab switches, your test will be auto-submitted.`);
                    }
                    return newCount;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [testData]); // Removed dependencies that change quickly to prevent constantly rebounding the listener

    const handleSelectOption = (questionId: string, optionId: string) => {
        setAnswers(prev => {
            const existing = prev.find(a => a.questionId === questionId);
            if (existing) {
                return prev.map(a => a.questionId === questionId ? { ...a, selectedOptionId: optionId } : a);
            }
            return [...prev, { questionId, selectedOptionId: optionId }];
        });
    };

    const handleSubmit = async () => {
        if(isSubmittingRef.current) return;
        setIsSubmitting(true);
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        try {
            // Need to pass the freshest answers, but because this might be called globally, rely on React state
            const res = await API.post('/company-test/submit', {
                patternId: params.id,
                answers, // React batches this fine normally, but in edge case auto-submit it takes the snapshot
                timeSpent
            });
            router.push(`/dashboard/student/company-tests/result/${res.data._id}`);
        } catch (err: any) {
            console.error(err);
            alert("Test submission failed. Please ensure your connection is stable.");
            setIsSubmitting(false);
        }
    };

    if (!testData) return <div className="fixed inset-0 z-[100] bg-gray-50 flex items-center justify-center"><div className="text-xl font-medium text-blue-600 animate-pulse tracking-wide">Initializing Secure Test Environment...</div></div>;

    const questions = testData.questions;
    if(!questions || questions.length === 0) return <div className="p-10 text-center"><h2 className="text-red-600 text-xl font-bold mb-4">Database Error</h2><p className="text-gray-600 relative">Insufficient questions available in the bank to match this pattern.</p><button onClick={()=>router.back()} className="mt-4 px-4 py-2 bg-gray-200">Go Back</button></div>;

    const currentQ = questions[currentQuestionIdx];

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col font-sans">
            {/* Minimal Subdue Header */}
            <div className="bg-white shadow border-b px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h1 className="text-lg font-bold tracking-tight text-gray-800">{testData.pattern.name} Simulation</h1>
                    {tabSwitches > 0 && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold border border-red-200 animate-pulse">Warning: {tabSwitches}/{MAX_TAB_SWITCHES} Violations</span>}
                </div>
                <div className="flex items-center gap-6">
                    <div className={`px-5 py-2.5 rounded-lg font-mono text-xl font-bold shadow-inner ${timeLeft < 300 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-white'}`}>
                        {formatTime(timeLeft)}
                    </div>
                    <button onClick={() => { if(confirm('Are you sure you want to finalize and submit early?')) handleSubmit(); }} disabled={isSubmitting} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-md hover:bg-indigo-700 transition">
                        {isSubmitting ? 'Submitting...' : 'Finish Test'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-[320px] bg-white border-r overflow-y-auto p-4 shrink-0 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Question Navigator</h3>
                        <div className="flex flex-wrap gap-2">
                            {questions.map((q: any, idx: number) => {
                                const isAns = answers.some(a => a.questionId === q._id);
                                return (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentQuestionIdx(idx)}
                                        className={`w-11 h-11 rounded-lg text-sm font-bold border transition
                                            ${currentQuestionIdx === idx ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                                            ${isAns ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="bg-slate-100 p-5 rounded-xl border mb-2 mt-4 text-center">
                        <div className="text-sm font-semibold tracking-wide text-slate-800 mb-2">Completion</div>
                        <div className="text-2xl font-bold text-indigo-700 mb-4">{answers.length} / {questions.length}</div>
                        <div className="w-full bg-slate-300 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: `${(answers.length / questions.length) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Right Area (Flex Col for Sticky Footer) */}
                <div className="flex-1 flex flex-col bg-gray-50 relative">
                    
                    {/* Scrollable Question Content */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                        <div className="max-w-4xl mx-auto w-full flex flex-col">
                            <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider mb-6 w-max border border-indigo-200">
                                {currentQ.sectionAssigned || currentQ.category} Section
                            </span>
                            
                            <div className="bg-white p-8 rounded-2xl shadow-sm border mb-8 min-h-[150px] flex items-center">
                                <h2 className="text-2xl text-gray-800 font-medium leading-relaxed">
                                    <span className="font-bold mr-3 text-slate-400 font-mono">Q{currentQuestionIdx + 1}.</span> 
                                    {currentQ.text}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4 pb-10">
                                {currentQ.options.map((opt: any, i: number) => {
                                    const isSelected = answers.find(a => a.questionId === currentQ._id)?.selectedOptionId === opt._id;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectOption(currentQ._id, opt._id)}
                                            className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-5 hover:shadow-md outline-none
                                                ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
                                        >
                                            <div className={`w-6 h-6 rounded border-2 flex shrink-0 items-center justify-center transition
                                                ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                                                {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <span className={`text-lg leading-snug ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>{opt.text}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer at the bottom of the Question Pane */}
                    <div className="bg-white border-t px-8 py-5 flex justify-between items-center z-10 w-full shrink-0 shadow-sm">
                        <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
                            <button 
                                disabled={currentQuestionIdx === 0}
                                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                                className="px-8 py-3 bg-white border shadow-sm rounded-lg font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                            >
                                Back
                            </button>
                            <button 
                                disabled={currentQuestionIdx === questions.length - 1}
                                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                                className="px-8 py-3 bg-slate-800 shadow-md rounded-lg font-bold text-white hover:bg-slate-900 disabled:opacity-40 transition"
                            >
                                Next Question
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
