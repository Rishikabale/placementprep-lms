'use client';
import { useEffect, useState } from 'react';
import API from '../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function CompanyTestsList() {
    const [patterns, setPatterns] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchPatterns = async () => {
            try {
                const res = await API.get('/company-patterns');
                setPatterns(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPatterns();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Company-Specific Practice Tests</h1>
            <p className="text-gray-600 mb-8 border-b pb-4">Simulate real placement exams with pattern-based tests covering Aptitude, Logical, Verbal, and Coding domains.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patterns.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-500">
                        No company patterns available.
                    </div>
                ) : patterns.map((pattern) => (
                    <div key={pattern._id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-900">{pattern.name}</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">Simulation</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-grow">{pattern.description || 'Practice test following this company\'s specific section distributions and timing.'}</p>
                        
                        <div className="flex justify-between items-center text-sm mb-6 bg-gray-50 p-3 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Duration</span>
                                <span className="font-semibold text-gray-800">{pattern.totalDuration} Mins</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Negative Marking</span>
                                <span className={`font-semibold ${pattern.negativeMarking ? 'text-red-600' : 'text-green-600'}`}>
                                    {pattern.negativeMarking ? `Yes (-${pattern.negativeMarkValue})` : 'No'}
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={() => router.push(`/dashboard/student/company-tests/${pattern._id}`)}
                            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded hover:bg-blue-700 transition"
                        >
                            View Pattern & Start
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
