'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const studentLinks = [
        { name: 'Dashboard', href: '/dashboard/student' },
        { name: 'Courses', href: '/dashboard/student/courses' },
        { name: 'AI Mock Test', href: '/dashboard/student/ai-mock-test' },
        { name: 'Company Tests', href: '/dashboard/student/company-tests' },
        { name: 'Resume Analyzer', href: '/dashboard/student/resume-analyzer' },
        { name: 'Career Insights', href: '/dashboard/student/career-insights' },
        { name: 'Test History', href: '/dashboard/student/test-history' },
    ];

    const instructorLinks = [
        { name: 'Dashboard', href: '/dashboard/instructor' },
        { name: 'Manage Courses', href: '/dashboard/instructor/courses' },
        { name: 'Question Bank', href: '/dashboard/instructor/question-bank' },
        { name: 'Company Patterns', href: '/dashboard/instructor/patterns' },
        { name: 'Analytics', href: '/dashboard/instructor/analytics' },
    ];

    const adminLinks = [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Users', href: '/admin/users' },
        { name: 'Courses', href: '/admin/courses' },
        { name: 'Question Bank', href: '/admin/question-bank' },
        { name: 'Global Patterns', href: '/admin/patterns' },
        { name: 'Resume AI', href: '/admin/resume-analyzer' },
    ];

    const links = user?.role === 'admin' ? adminLinks : (user?.role === 'instructor' ? instructorLinks : studentLinks);

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-indigo-700 transition-colors">
                            P
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            Placement<span className="text-indigo-600">Prep</span>
                        </span>
                    </Link>

                    {/* Navigation Links (Centered/Right) */}
                    {user && (
                        <div className="hidden lg:flex space-x-6 h-full overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {links.map((link) => {
                                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`inline-flex items-center px-1 pt-1 text-[13px] font-medium transition-colors h-full border-b-2 ${isActive
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* User Profile / Auth Actions */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4 relative">
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                                    <p className="text-xs text-gray-500 mt-1 capitalize">{user.role}</p>
                                </div>
                                <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border border-gray-200 text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors border-l border-gray-200 pl-4 ml-2"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                                    Log in
                                </Link>
                                <Link href="/register" className="btn-primary text-sm px-4 py-2">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
