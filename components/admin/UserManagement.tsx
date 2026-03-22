import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Shield, User } from 'lucide-react';

export const UserManagement = ({ language }: { language: 'en' | 'hi' }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await api.getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const toggleRole = async (userId: string, currentRole: 'user' | 'admin') => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await api.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role.");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading users...</div>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-subtle border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
                <Users className="text-gov-teal" /> User Management
            </h2>
            <table className="w-full text-left">
                <thead>
                    <tr className="text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-4">User</th>
                        <th className="py-4">Role</th>
                        <th className="py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="py-4">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={user.photoURL} 
                                        alt={user.displayName} 
                                        className="w-10 h-10 rounded-full" 
                                        referrerPolicy="no-referrer"
                                    />
                                    <div>
                                        <p className="font-bold text-sm">{user.displayName}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="py-4">
                                <button 
                                    onClick={() => toggleRole(user.id, user.role)}
                                    className="flex items-center gap-2 text-sm font-bold text-gov-navy hover:text-blue-600"
                                >
                                    {user.role === 'admin' ? <User size={16} /> : <Shield size={16} />}
                                    Make {user.role === 'admin' ? 'User' : 'Admin'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
