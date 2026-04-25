'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await API.get('/admin/users', { params: { role: filterRole, search: searchQuery } });
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filterRole]); // Search triggers manually via button

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const toggleStatus = async (id: string) => {
        try {
            await API.put(`/admin/users/${id}/status`);
            fetchUsers(); // Refresh
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm('Are you absolutely sure you want to delete this user? This cannot be undone.')) return;
        try {
            await API.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="form-input flex-1 text-sm border-slate-300 rounded-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-700">Search</button>
                    {searchQuery && (
                        <button type="button" onClick={() => { setSearchQuery(''); setTimeout(fetchUsers, 0); }} className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-md text-sm border border-slate-200">Clear</button>
                    )}
                </form>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-700">Role:</span>
                    <select 
                        className="form-select text-sm border-slate-300 rounded-md"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                                    <div className="text-sm text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${
                                                user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 
                                                user.role === 'instructor' ? 'bg-sky-100 text-sky-800' : 
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.isActive === false ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => toggleStatus(user._id)} 
                                                className={`mr-3 ${user.isActive === false ? 'text-green-600 hover:text-green-900' : 'text-amber-600 hover:text-amber-900'}`}
                                            >
                                                {user.isActive === false ? 'Activate' : 'Suspend'}
                                            </button>
                                            <button 
                                                onClick={() => deleteUser(user._id)} 
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
            </div>
        </div>
    );
}
