export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    token?: string;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    instructor: { name: string };
    modules: Module[];
    tags: string[];
}

export interface Module {
    title: string;
    videos: Video[];
}

export interface Video {
    _id: string;
    title: string;
    url: string;
    duration: number;
    quizId?: string;
}

export interface Quiz {
    _id: string;
    title: string;
    questions: Question[];
    duration: number;
    passingScore: number;
}

export interface Question {
    _id: string;
    text: string;
    options: { text: string; isCorrect: boolean }[];
    type: 'MCQ' | 'CODING';
}
