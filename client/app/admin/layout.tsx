'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'admin') {
        return <div className="min-h-screen flex items-center justify-center">Loading Data...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 w-full max-w-screen-2xl mx-auto p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
