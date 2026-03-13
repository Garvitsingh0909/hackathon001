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
    ArrowDownRight
} from 'lucide-react';
import { WaterQualityReport } from '../types';
import { api } from '../services/api';
import { db } from '../src/firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export const AdminDashboard = ({ isAdmin, setActiveTab }: { isAdmin: boolean, setActiveTab: (tab: string) => void }) => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Reviewed' | 'Resolved'>('all');
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            if (!isAdmin) {
                setLoading(false);
                return;
            }
            try {
                const data = await api.getReports().catch(e => {
                    // Suppress expected permission errors
                    return [];
                });
                setReports(data);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [isAdmin]);

    const updateStatus = async (reportId: string, newStatus: string) => {
        try {
            const reportRef = doc(db, 'reports', reportId);
            // Check if document exists
            const reportSnap = await getDoc(reportRef);
            if (!reportSnap.exists()) {
                throw new Error("Report not found");
            }
            await updateDoc(reportRef, {
                status: newStatus
            });
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
            console.log(`[AdminDashboard] Status updated for ${reportId}`);
        } catch (error: any) {
            if (error.message === "Report not found") {
                alert("This report no longer exists.");
                setReports(prev => prev.filter(r => r.id !== reportId));
            } else {
                console.error("[AdminDashboard] Error updating status:", error);
                alert("Failed to update report status. Please try again.");
            }
        }
    };

    const deleteReport = async (reportId: string) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                await deleteDoc(doc(db, 'reports', reportId));
                setReports(prev => prev.filter(r => r.id !== reportId));
            } catch (error) {
                console.error("Error deleting report:", error);
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
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-teal"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${process.env.GEMINI_API_KEY ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${process.env.GEMINI_API_KEY ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm ${process.env.GEMINI_API_KEY ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
                            {process.env.GEMINI_API_KEY ? 'Gemini AI Active' : 'Gemini AI Inactive'}
                        </h4>
                        <p className={`text-xs ${process.env.GEMINI_API_KEY ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                            {process.env.GEMINI_API_KEY ? 'Water intelligence and analysis systems are operational.' : 'Please set GEMINI_API_KEY in environment variables to enable AI features.'}
                        </p>
                    </div>
                </div>
                {!process.env.GEMINI_API_KEY && (
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        Get Free Key
                    </a>
                )}
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-subtle border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold font-display">Water Quality Reports</h2>
                        <p className="text-slate-500 text-sm">Manage and review all analyzed water samples</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => setActiveTab('admin-users')}
                            className="px-4 py-2 bg-gov-navy text-white rounded-xl text-sm font-bold hover:bg-gov-navy/90 transition-all"
                        >
                            Manage Users
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search reports..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gov-teal transition-all"
                            />
                        </div>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gov-teal"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User / Location</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Algae Level</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredReports.map((report) => (
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
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                report.overallScore >= 80 ? 'bg-emerald-500' :
                                                report.overallScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></div>
                                            <span className="font-bold text-sm">{report.overallScore}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                            report.algaeLevel === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            report.algaeLevel === 'Moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        }`}>
                                            {report.algaeLevel}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <select 
                                            value={report.status}
                                            disabled={!isAdmin}
                                            onChange={(e) => updateStatus(report.id, e.target.value)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-full border focus:outline-none transition-all ${
                                                !isAdmin ? 'cursor-not-allowed opacity-50 bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' : 
                                                report.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                report.status === 'Reviewed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            }`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Reviewed">Reviewed</option>
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
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredReports.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No reports found</h3>
                        <p className="text-slate-500">Try adjusting your search or filters</p>
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
                                <button className="px-6 py-2 bg-gov-navy dark:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-105 transition-all">
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-subtle border border-slate-200 dark:border-slate-800 flex items-start justify-between group hover:shadow-subtle-hover transition-all">
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
            <h3 className="text-3xl font-bold font-display text-slate-900 dark:text-white">{value}</h3>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}
            </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
            {icon}
        </div>
    </div>
);
