'use client';

import { useEffect, useState, use } from 'react';
import API from '../../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = use(params);
    const searchParams = useSearchParams();
    const videoIdParam = searchParams.get('videoId');

    const [course, setCourse] = useState<any>(null);
    const [activeVideo, setActiveVideo] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await API.get(`/courses/${courseId}`);
                setCourse(data);

                // Logic to select video
                let foundVideo = null;

                // 1. Try to find by URL param
                if (videoIdParam) {
                    data.modules.forEach((mod: any) => {
                        const v = mod.videos.find((vid: any) => vid._id === videoIdParam);
                        if (v) foundVideo = v;
                    });
                }

                // 2. Fallback to first video if not found or no param
                if (!foundVideo && data.modules.length > 0 && data.modules[0].videos.length > 0) {
                    foundVideo = data.modules[0].videos[0];
                }

                if (foundVideo) {
                    setActiveVideo(foundVideo);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchCourse();
    }, [courseId, videoIdParam]);

    if (!course) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row">
                {/* Video Player Section */}
                <div className="w-full md:w-3/4 md:pr-4 space-y-6">
                    {activeVideo ? (
                        <div>
                            {/* Video Player Container */}
                            <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg aspect-video">
                                <video
                                    controls
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={activeVideo.url}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            {/* Video Metadata */}
                            <div className="mt-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900">{activeVideo.title}</h2>
                                <p className="text-gray-600 mt-2 leading-relaxed">{activeVideo.description}</p>

                                {/* Quiz Trigger */}
                                {activeVideo.quizId && (
                                    <div className="mt-6 border-t pt-4">
                                        <button
                                            onClick={() => router.push(`/quiz/${activeVideo.quizId}`)}
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                        >
                                            Take Quiz for this Video
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                            Select a video from the list to start learning
                        </div>
                    )}
                </div>

                {/* Syllabus / Module List */}
                <div className="w-full md:w-1/4 mt-6 md:mt-0 bg-white shadow rounded-lg p-4 h-fit">
                    <h3 className="text-lg font-bold mb-4">Course Content</h3>
                    {course.modules.map((module: any, mIdx: number) => (
                        <div key={mIdx} className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">{module.title}</h4>
                            <ul className="space-y-2">
                                {module.videos.map((video: any) => (
                                    <li
                                        key={video._id}
                                        className={`cursor-pointer p-2 rounded ${activeVideo?._id === video._id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                                        onClick={() => setActiveVideo(video)}
                                    >
                                        <div className="flex items-center text-sm">
                                            <span className="mr-2">🎥</span>
                                            {video.title}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
