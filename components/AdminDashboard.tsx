import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminMap } from './AdminMap';
import { UserManagement } from './admin/UserManagement';
import { 
    LayoutDashboard, 
    FileText, 
    MessageSquare, 
    Settings, 
    Users, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    Trash2, 
    Search, 
    Filter, 
    MoreVertical, 
    ArrowUpRight, 
    ArrowDownRight, 
    TrendingUp, 
    Droplets, 
    ShieldAlert, 
    Loader2,
    BarChart3,
    PieChart as PieChartIcon,
    Calendar,
    Download,
    RefreshCw,
    Eye,
    ChevronRight,
    Star,
    Map
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../src/firebase';
import { toast } from 'react-hot-toast';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';

import { handleFirestoreError, OperationType } from '../services/api';

interface Report {
    id: string;
    location: string;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved';
    imageUrl?: string;
    createdAt: any;
    analysis?: {
        score: number;
        status: string;
    };
    userId?: string;
}

interface Feedback {
    id: string;
    name: string;
    email: string;
    message: string;
    rating: number;
    category: string;
    status: 'new' | 'read' | 'archived';
    createdAt: any;
}

export const AdminDashboard = ({ language }: { language: 'en' | 'hi' }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'feedback' | 'map' | 'users'>('overview');
    const [reports, setReports] = useState<Report[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showParameters, setShowParameters] = useState(false);

    useEffect(() => {
        const qReports = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const qFeedback = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));

        const unsubReports = onSnapshot(qReports, (snapshot) => {
            setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
            setLoading(false);
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'reports');
        });

        const unsubFeedback = onSnapshot(qFeedback, (snapshot) => {
            setFeedback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback)));
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'feedback');
        });

        return () => {
            unsubReports();
            unsubFeedback();
        };
    }, []);

    const updateStatus = async (id: string, type: 'reports' | 'feedback', status: string) => {
        try {
            await updateDoc(doc(db, type, id), { status });
            toast.success(`Status updated to ${status}`);
        } catch (error) {
            toast.error('Failed to update status');
            handleFirestoreError(error, OperationType.UPDATE, `${type}/${id}`);
        }
    };

    const deleteItem = async (id: string, type: 'reports' | 'feedback') => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteDoc(doc(db, type, id));
            toast.success('Item deleted successfully');
        } catch (error) {
            toast.error('Failed to delete item');
            handleFirestoreError(error, OperationType.DELETE, `${type}/${id}`);
        }
    };

    const stats = {
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        avgRating: feedback.length > 0 
            ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1) 
            : '0.0',
        criticalAlerts: reports.filter(r => r.analysis?.score && r.analysis.score > 70).length
    };

    const chartData = [
        { name: 'Mon', reports: 12, feedback: 5 },
        { name: 'Tue', reports: 19, feedback: 8 },
        { name: 'Wed', reports: 15, feedback: 12 },
        { name: 'Thu', reports: 22, feedback: 7 },
        { name: 'Fri', reports: 30, feedback: 15 },
        { name: 'Sat', reports: 25, feedback: 20 },
        { name: 'Sun', reports: 18, feedback: 10 },
    ];

    const feedbackDist = [
        { name: 'Suggestion', value: feedback.filter(f => f.category === 'suggestion').length },
        { name: 'Bug', value: feedback.filter(f => f.category === 'bug').length },
        { name: 'Compliment', value: feedback.filter(f => f.category === 'compliment').length },
        { name: 'Other', value: feedback.filter(f => f.category === 'other').length },
    ];

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                        Admin <span className="text-blue-600">Control Center</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Manage water reports, community feedback, and system intelligence.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsRefreshing(true)}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <Download size={18} /> Export Data
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Reports', value: stats.totalReports, icon: FileText, color: 'blue', trend: '+12%' },
                    { label: 'Pending Review', value: stats.pendingReports, icon: Clock, color: 'amber', trend: '-5%' },
                    { label: 'Critical Alerts', value: stats.criticalAlerts, icon: ShieldAlert, color: 'red', trend: '+2%' },
                    { label: 'Avg. Rating', value: stats.avgRating, icon: Star, color: 'emerald', trend: '+0.4' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-subtle relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-12 -mt-12 transition-transform group-hover:scale-150`}></div>
                        <div className="relative z-10 flex items-start justify-between">
                            <div className="space-y-4">
                                <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl w-fit`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white font-display mt-1">{stat.value}</h3>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-subtle overflow-hidden">
                <div className="flex border-b border-slate-100 dark:border-slate-800 px-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'map', label: 'Command Map', icon: Map },
                        { id: 'reports', label: 'Reports', icon: FileText },
                        { id: 'feedback', label: 'Feedback', icon: MessageSquare },
                        { id: 'users', label: 'Users', icon: Users },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-8 py-6 text-sm font-bold transition-all relative ${
                                activeTab === tab.id 
                                ? 'text-blue-600' 
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div 
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                            >
                                {/* Activity Chart */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <TrendingUp size={20} className="text-blue-600" />
                                            System Activity
                                        </h4>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500">7 DAYS</button>
                                            <button className="px-3 py-1.5 text-[10px] font-bold text-slate-400">30 DAYS</button>
                                        </div>
                                    </div>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Area type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" />
                                                <Area type="monotone" dataKey="feedback" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Distribution Chart */}
                                <div className="lg:col-span-4 space-y-6">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <PieChartIcon size={20} className="text-emerald-600" />
                                        Feedback Mix
                                    </h4>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={feedbackDist}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {feedbackDist.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-3">
                                        {feedbackDist.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'map' && (
                            <motion.div 
                                key="map"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <AdminMap language={language} embedded={true} />
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div 
                                key="users"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <UserManagement language={language} embedded={true} />
                            </motion.div>
                        )}

                        {activeTab === 'reports' && (
                            <motion.div 
                                key="reports"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-col md:flex-row gap-4 justify-between">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text"
                                            placeholder="Search reports by location or description..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2">
                                            <Filter size={16} /> Filter
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Report Info</th>
                                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analysis</th>
                                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {(reports || []).filter(r => (r.location || '').toLowerCase().includes((searchQuery || '').toLowerCase())).map((report) => (
                                                <tr key={report.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                                                {report.imageUrl ? (
                                                                    <img 
                                                                        src={report.imageUrl} 
                                                                        alt="Report" 
                                                                        className="w-full h-full object-cover" 
                                                                        referrerPolicy="no-referrer"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                        <Droplets size={20} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{report.location}</p>
                                                                <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{report.description}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6">
                                                        {report.analysis ? (
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                                                    report.analysis.score > 70 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                                                }`}>
                                                                    {report.analysis.score}
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{report.analysis.status}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No analysis</span>
                                                        )}
                                                    </td>
                                                    <td className="py-6">
                                                        <select 
                                                            value={report.status}
                                                            onChange={(e) => updateStatus(report.id, 'reports', e.target.value)}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${
                                                                report.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                                                                report.status === 'reviewed' ? 'bg-blue-50 text-blue-600' : 
                                                                'bg-emerald-50 text-emerald-600'
                                                            }`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="reviewed">Reviewed</option>
                                                            <option value="resolved">Resolved</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-6">
                                                        <p className="text-xs text-slate-500">{report.createdAt?.toDate().toLocaleDateString()}</p>
                                                    </td>
                                                    <td className="py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedItem(report);
                                                                    setShowParameters(false);
                                                                }}
                                                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteItem(report.id, 'reports')}
                                                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
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
                            </motion.div>
                        )}

                        {activeTab === 'feedback' && (
                            <motion.div 
                                key="feedback"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {(feedback || []).map((item) => (
                                    <motion.div 
                                        key={item.id}
                                        whileHover={{ y: -5 }}
                                        className={`p-6 rounded-[2rem] border transition-all relative group ${
                                            item.status === 'new' 
                                            ? 'bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30' 
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                                        }`}
                                    >
                                        {item.status === 'new' && (
                                            <div className="absolute top-6 right-6 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                        )}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">{item.name || 'Anonymous'}</h5>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.category}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-1 mb-4">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={14} className={s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'} />
                                            ))}
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed italic">
                                            "{item.message}"
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.createdAt?.toDate().toLocaleDateString()}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => updateStatus(item.id, 'feedback', item.status === 'new' ? 'read' : 'new')}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteItem(item.id, 'feedback')}
                                                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <div className="relative h-64 bg-slate-100 dark:bg-slate-800">
                                {selectedItem.imageUrl ? (
                                    <img 
                                        src={selectedItem.imageUrl} 
                                        alt="Detail" 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Droplets size={64} />
                                    </div>
                                )}
                                <button 
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display mb-1">{selectedItem.location}</h3>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                            <Calendar size={14} /> {selectedItem.createdAt?.toDate().toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        selectedItem.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                        {selectedItem.status}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</h4>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {selectedItem.description}
                                    </p>
                                </div>

                                {selectedItem.analysis && (
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Score</p>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{selectedItem.analysis.score || selectedItem.analysis.overallScore || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Status</p>
                                                <p className="text-lg font-bold text-blue-600">{selectedItem.analysis.status || selectedItem.analysis.recommendation || 'Analyzed'}</p>
                                            </div>
                                        </div>

                                        {Object.keys({
                                            ...(selectedItem.analysis.parameters || {}),
                                            ...(selectedItem.analysis.algaeLevel ? { algaeLevel: selectedItem.analysis.algaeLevel } : {}),
                                            ...(selectedItem.analysis.foamDetected !== undefined ? { foamDetected: selectedItem.analysis.foamDetected ? 'Yes' : 'No' } : {}),
                                            ...(selectedItem.analysis.turbidity ? { turbidity: selectedItem.analysis.turbidity } : {}),
                                            ...(selectedItem.analysis.color ? { color: selectedItem.analysis.color } : {})
                                        }).length > 0 && (
                                            <>
                                                <button 
                                                    onClick={() => setShowParameters(!showParameters)}
                                                    className="text-sm font-bold text-blue-600 text-left flex items-center gap-1 mt-2"
                                                >
                                                    {showParameters ? 'Hide Parameters' : 'View Analyzed Parameters'}
                                                </button>
                                                
                                                {showParameters && (
                                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
                                                        {Object.entries({
                                                            ...(selectedItem.analysis.parameters || {}),
                                                            ...(selectedItem.analysis.algaeLevel ? { algaeLevel: selectedItem.analysis.algaeLevel } : {}),
                                                            ...(selectedItem.analysis.foamDetected !== undefined ? { foamDetected: selectedItem.analysis.foamDetected ? 'Yes' : 'No' } : {}),
                                                            ...(selectedItem.analysis.turbidity ? { turbidity: selectedItem.analysis.turbidity } : {}),
                                                            ...(selectedItem.analysis.color ? { color: selectedItem.analysis.color } : {})
                                                        }).map(([key, value]) => (
                                                            <div key={key}>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{String(value)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg">
                                        Mark as Resolved
                                    </button>
                                    <button className="px-8 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                        Contact User
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
