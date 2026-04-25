'use client';

import { useEffect, useState, use } from 'react';
import API from '../../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function ManageCourse({ params }: { params: Promise<{ courseId: string }> }) {
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const courseId = resolvedParams.courseId;

    const [videoForm, setVideoForm] = useState({
        title: '',
        description: '',
        url: '',
        duration: 0,
        moduleIndex: 0
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const [newModuleTitle, setNewModuleTitle] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await API.get(`/courses/${courseId}`);
                setCourse(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleAddModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newModuleTitle.trim()) return;

        try {
            await API.post(`/courses/${courseId}/modules`, { title: newModuleTitle });
            // Refresh
            const { data } = await API.get(`/courses/${courseId}`);
            setCourse(data);
            setNewModuleTitle('');
            alert('Module added successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to add module');
        }
    };

    const handleVideoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('courseId', courseId);
            formData.append('moduleIndex', videoForm.moduleIndex.toString());
            formData.append('title', videoForm.title);
            formData.append('description', videoForm.description);
            formData.append('duration', videoForm.duration.toString());

            if (videoFile) {
                formData.append('video', videoFile);
            } else if (videoForm.url) {
                formData.append('url', videoForm.url);
            } else {
                alert('Please provide a video URL or upload a file');
                return;
            }

            await API.post('/courses/video', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Refresh course data
            const { data } = await API.get(`/courses/${courseId}`);
            setCourse(data);
            // Reset form
            setVideoForm({ ...videoForm, title: '', description: '', url: '', duration: 0 });
            setVideoFile(null);
            alert('Video added successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to add video');
        }
    };

    const handleDeleteVideo = async (moduleIndex: number, videoId: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;
        try {
            await API.delete(`/courses/${courseId}/modules/${moduleIndex}/videos/${videoId}`);
            // Refresh
            const { data } = await API.get(`/courses/${courseId}`);
            setCourse(data);
        } catch (error) {
            console.error(error);
            alert('Failed to delete video');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Manage: {course.title}</h1>
                    <button onClick={() => router.back()} className="text-indigo-600 hover:text-indigo-900">
                        &larr; Back to Dashboard
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Course Content List */}
                    <div className="space-y-8">
                        {/* Add Module Section */}
                        <div className="bg-white shadow sm:rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-black">Add New Module</h2>
                            <form onSubmit={handleAddModule} className="flex gap-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="Module Title (e.g. Number Systems)"
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                    className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Add Module
                                </button>
                            </form>
                        </div>

                        <div className="bg-white shadow sm:rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-black">Course Structure</h2>
                            {course.modules.length === 0 ? (
                                <p className="text-gray-500">No modules yet. Add one above.</p>
                            ) : (
                                course.modules.map((module: any, mIndex: number) => (
                                    <div key={mIndex} className="mb-6 last:mb-0">
                                        <h3 className="font-medium text-lg text-black mb-2 border-b pb-1">{module.title}</h3>
                                        <ul className="space-y-2">
                                            {module.videos.length === 0 ? (
                                                <li className="text-sm text-gray-400 italic ml-4">No videos in this module</li>
                                            ) : (
                                                module.videos.map((video: any) => (
                                                    <li key={video._id} className="flex items-center justify-between text-sm text-gray-800 ml-4 py-2 border-b last:border-0 border-gray-100">
                                                        <div className="flex items-center">
                                                            <span className="w-4 h-4 mr-2 bg-indigo-100 rounded-full flex-shrink-0"></span>
                                                            <span className="font-medium text-black">{video.title}</span>
                                                            <span className="ml-1 text-gray-600">({Math.round(video.duration / 60)} min)</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            {video.quizId ? (
                                                                <div className="flex space-x-2">
                                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">Quiz Active</span>
                                                                    <button
                                                                        onClick={() => router.push(`/dashboard/instructor/quiz/${video.quizId._id}/results`)}
                                                                        className="text-xs text-indigo-600 hover:text-indigo-900 underline"
                                                                    >
                                                                        View Results
                                                                    </button>
                                                                    <span className="text-gray-300">|</span>
                                                                    <button
                                                                        onClick={() => router.push(`/dashboard/instructor/quiz/${video.quizId._id}/edit?courseId=${courseId}`)}
                                                                        className="text-xs text-indigo-600 hover:text-indigo-900 underline"
                                                                    >
                                                                        Edit Quiz
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => router.push(`/dashboard/instructor/quiz/create?videoId=${video._id}&courseId=${courseId}`)}
                                                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold"
                                                                >
                                                                    + Add Quiz
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteVideo(mIndex, video._id)}
                                                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Add Video Form */}
                    <div className="bg-white shadow sm:rounded-lg p-6 h-fit">
                        <h2 className="text-xl font-semibold mb-4 text-black">Add New Video</h2>
                        {course.modules.length === 0 ? (
                            <div className="text-yellow-600 bg-yellow-50 p-4 rounded-md">
                                Please create a module first before adding videos.
                            </div>
                        ) : (
                            <form onSubmit={handleVideoSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Module</label>
                                    <select
                                        value={videoForm.moduleIndex}
                                        onChange={(e) => setVideoForm({ ...videoForm, moduleIndex: Number(e.target.value) })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                    >
                                        {course.modules.map((module: any, idx: number) => (
                                            <option key={idx} value={idx}>{module.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Video Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={videoForm.title}
                                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={videoForm.description}
                                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Video Source</label>
                                    <div className="mt-2 space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Option 1: Upload File</p>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            />
                                        </div>
                                        <div className="relative flex py-1 items-center">
                                            <div className="flex-grow border-t border-gray-300"></div>
                                            <span className="flex-shrink-0 mx-2 text-gray-400 text-xs">OR</span>
                                            <div className="flex-grow border-t border-gray-300"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Option 2: External URL</p>
                                            <input
                                                type="url"
                                                placeholder="https://example.com/video.mp4"
                                                value={videoForm.url}
                                                onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                                                disabled={!!videoFile}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={videoForm.duration || ''}
                                        onChange={(e) => setVideoForm({ ...videoForm, duration: Number(e.target.value) })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Example: 600 for 10 minutes</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Add Video
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
