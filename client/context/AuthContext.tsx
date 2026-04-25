'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API from '../lib/api';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role?: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            if (data.role === 'student') router.push('/dashboard/student');
            else if (data.role === 'instructor') router.push('/dashboard/instructor');
            else if (data.role === 'admin') router.push('/admin/dashboard');
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, role: string = 'student') => {
        try {
            const { data } = await API.post('/auth/register', { name, email, password, role });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            if (data.role === 'student') router.push('/dashboard/student');
            else if (data.role === 'instructor') router.push('/dashboard/instructor');
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
