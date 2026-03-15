import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    FileText, 
    TrendingUp, 
    AlertCircle, 
    CheckCircle, 
    Clock, 
    Search, 
    Filter, 
    MoreVertical, 
    Download, 
    Trash2, 
    Eye,
    Map as MapIcon,
    Droplets,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { WaterQualityReport } from '../types';
import { api } from '../services/api';
import { db } from '../src/firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export const AdminDashboard = ({ isAdmin, setActiveTab }: { isAdmin: boolean, setActiveTab: (tab: string) => void }) => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Reviewed' | 'Resolved'>('all');
    const [activeAdminTab, setActiveAdminTab] = useState<'reports' | 'feedback'>('reports');
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [feedback, setFeedback] = useState<any[]>([]);

    useEffect(() => {
        const fetchAdminData = async () => {
            if (!isAdmin) {
                setLoading(false);
                return;
            }
            try {
                const [reportsData, feedbackData] = await Promise.all([
                    api.getReports().catch(() => []),
                    api.getFeedback().catch(() => [])
                ]);
                setReports(reportsData);
                setFeedback(feedbackData);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, [isAdmin]);

    const updateStatus = async (reportId: string, newStatus: string) => {
        if (!isAdmin) {
            alert("You do not have permission to update status.");
            return;
        }
        try {
            const reportRef = doc(db, 'reports', reportId);
            await updateDoc(reportRef, {
                status: newStatus
            });
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
            toast.success("Status updated successfully.");
            console.log(`[AdminDashboard] Status updated for ${reportId}`);
        } catch (error: any) {
            console.error("[AdminDashboard] Error updating status:", error);
            // Check for both error code and message
            if (error.code === 'not-found' || (error.message && error.message.includes('No document to update'))) {
                toast.error("This report no longer exists.");
                setReports(prev => prev.filter(r => r.id !== reportId));
            } else {
                toast.error(`Failed to update report status: ${error.message}`);
            }
        }
    };

    const deleteReport = async (reportId: string) => {
        if (!isAdmin) {
            toast.error("You do not have permission to delete reports.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                await deleteDoc(doc(db, 'reports', reportId));
                setReports(prev => prev.filter(r => r.id !== reportId));
                toast.success("Report deleted successfully.");
            } catch (error: any) {
                console.error("Error deleting report:", error);
                toast.error(`Failed to delete report: ${error.message}`);
            }
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = 
            report.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.algaeLevel?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'Pending').length,
        critical: reports.filter(r => r.overallScore < 50).length,
        avgScore: reports.length > 0 
            ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length) 
            : 0
    };

    if (loading) {
        return (
            <div className="space-y-8 pb-12 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800 rounded-[2rem]"></div>)}
                </div>
                <div className="h-[500px] bg-slate-100 dark:bg-slate-800 rounded-[2rem]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Reports" 
                    value={stats.total} 
                    icon={<FileText className="text-blue-500" />} 
                    trend="+12%" 
                    trendUp={true} 
                />
                <StatCard 
                    title="Pending Review" 
                    value={stats.pending} 
                    icon={<Clock className="text-amber-500" />} 
                    trend="5 new" 
                    trendUp={false} 
                />
                <StatCard 
                    title="Critical Alerts" 
                    value={stats.critical} 
                    icon={<AlertCircle className="text-red-500" />} 
                    trend="-2%" 
                    trendUp={false} 
                />
                <StatCard 
                    title="Avg. Water Quality" 
                    value={`${stats.avgScore}%`} 
                    icon={<Droplets className="text-gov-teal" />} 
                    trend="+3%" 
                    trendUp={true} 
                />
            </div>

            {/* API Status Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-[2rem] border flex items-center justify-between shadow-sm ${process.env.GEMINI_API_KEY ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${process.env.GEMINI_API_KEY ? 'bg-emerald-500 text-white shadow-emerald-600/50' : 'bg-amber-500 text-white shadow-amber-600/50'}`}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h4 className={`font-bold text-base font-display ${process.env.GEMINI_API_KEY ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
                            {process.env.GEMINI_API_KEY ? 'Gemini AI Active' : 'Gemini AI Inactive'}
                        </h4>
                        <p className={`text-sm mt-1 ${process.env.GEMINI_API_KEY ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                            {process.env.GEMINI_API_KEY ? 'Water intelligence and analysis systems are operational.' : 'Please set GEMINI_API_KEY in environment variables to enable AI features.'}
                        </p>
                    </div>
                </div>
                {!process.env.GEMINI_API_KEY && (
                    <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-md"
                    >
                        Get Free Key
                    </motion.a>
                )}
            </motion.div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-subtle">
                <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-8">
                        <button 
                            onClick={() => setActiveAdminTab('reports')}
                            className={`text-xl font-bold pb-3 transition-all relative ${activeAdminTab === 'reports' ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            Water Quality Reports
                            {activeAdminTab === 'reports' && (
                                <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-gov-teal rounded-t-full" />
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveAdminTab('feedback')}
                            className={`text-xl font-bold pb-3 transition-all relative ${activeAdminTab === 'feedback' ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            User Feedback
                            {activeAdminTab === 'feedback' && (
                                <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-gov-teal rounded-t-full" />
                            )}
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('admin-users')}
                            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md"
                        >
                            Manage Users
                        </motion.button>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search reports..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-64 shadow-inner"
                            />
                        </div>
                        <div className="flex gap-1 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                            {(['all', 'Pending', 'Reviewed', 'Resolved'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                        filterStatus === status 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {activeAdminTab === 'reports' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User / Location</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Algae Level</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                            <td className="px-8 py-5"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                            <td className="px-8 py-5"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
                                            <td className="px-8 py-5"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                            <td className="px-8 py-5"><div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <FileText size={48} className="mb-4 opacity-20" />
                                                <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">No reports found</p>
                                                <p className="text-sm">Try adjusting your search or filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    {report.imageUrl ? (
                                                        <img src={report.imageUrl} alt="Sample" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400"><Droplets size={20} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{report.userName || 'Anonymous'}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapIcon size={12} /> {report.locationName || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-mono text-slate-900 dark:text-slate-100">{report.overallScore}%</td>
                                        <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">{report.algaeLevel}</td>
                                        <td className="px-8 py-5">
                                            <select 
                                                value={report.status}
                                                onChange={(e) => updateStatus(report.id, e.target.value)}
                                                className="bg-transparent text-sm font-bold text-gov-teal focus:outline-none cursor-pointer hover:underline"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Review">In Review</option>
                                                <option value="Action Taken">Action Taken</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                <Calendar size={14} />
                                                {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setSelectedReport(report)}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteReport(report.id)}
                                                    disabled={!isAdmin}
                                                    className={`p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Email</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Message</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-5"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                            <td className="px-8 py-5"><div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                            <td className="px-8 py-5"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                                        </tr>
                                    ))
                                ) : feedback.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <MessageSquare size={48} className="mb-4 opacity-20" />
                                                <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">No feedback yet</p>
                                                <p className="text-sm">When users submit feedback, it will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    feedback.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-5 text-sm text-slate-900 dark:text-white">{item.email}</td>
                                            <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-300">{item.message}</td>
                                            <td className="px-8 py-5 text-sm text-slate-500">
                                                {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Report Detail Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedReport(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold font-display">Report Details</h3>
                                <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                            
                            <div className="p-8 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <img src={selectedReport.imageUrl} alt="Water Sample" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Metadata</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Report ID:</span>
                                                    <span className="font-mono text-xs">{selectedReport.id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">User UID:</span>
                                                    <span className="font-mono text-xs truncate max-w-[150px]">{selectedReport.userId}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Analysis Results</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Score</p>
                                                    <p className="text-lg font-bold">{selectedReport.overallScore}%</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Algae</p>
                                                    <p className="text-lg font-bold">{selectedReport.algaeLevel}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Findings</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedReport.details}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Recommendation</h4>
                                            <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50">{selectedReport.recommendation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button 
                                    onClick={() => setSelectedReport(null)}
                                    className="px-6 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Close
                                </button>
                                <button onClick={() => console.log('Export PDF clicked')} className="px-6 py-2 bg-gov-navy dark:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-105 transition-all">
                                    Export PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, trendUp }: any) => (
    <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-subtle hover:shadow-subtle-hover"
    >
        <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
            <div className="text-slate-400 dark:text-slate-500">
                {icon}
            </div>
        </div>
        <div className="flex items-end justify-between">
            <h3 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">{value}</h3>
            <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}
            </div>
        </div>
    </motion.div>
);
