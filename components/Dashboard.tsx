import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Droplets, 
    Wind, 
    Thermometer, 
    AlertTriangle, 
    Activity, 
    TrendingUp, 
    MapPin, 
    Calendar, 
    ChevronRight, 
    Search, 
    Bell, 
    User, 
    ArrowUpRight, 
    ArrowDownRight, 
    Layers, 
    ShieldCheck, 
    Info, 
    Play,
    Zap,
    Waves,
    CloudRain,
    Sun,
    Cloud
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    LineChart, 
    Line,
    BarChart,
    Bar
} from 'recharts';
import { toast } from 'react-hot-toast';
import { TRANSLATIONS } from '../constants';
import { getReports, getWeather } from '../services/api';
import { DisclaimerBanner } from './ui/DisclaimerBanner';

const data = [
    { name: '00:00', ph: 7.2, tds: 240, turbidity: 1.2 },
    { name: '04:00', ph: 7.1, tds: 245, turbidity: 1.5 },
    { name: '08:00', ph: 7.3, tds: 235, turbidity: 1.1 },
    { name: '12:00', ph: 7.4, tds: 230, turbidity: 1.0 },
    { name: '16:00', ph: 7.2, tds: 242, turbidity: 1.3 },
    { name: '20:00', ph: 7.1, tds: 248, turbidity: 1.6 },
    { name: '24:00', ph: 7.2, tds: 240, turbidity: 1.2 },
];

const StatCard = ({ label, value, unit, icon: Icon, trend, color }: any) => (
    <motion.div 
        whileHover={{ y: -2, scale: 1.01 }}
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-16 h-16 bg-${color}-500/5 rounded-full blur-xl -mr-8 -mt-8 transition-transform group-hover:scale-150`}></div>
        <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-2">
                <div className={`p-2 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 rounded-lg w-fit`}>
                    <Icon size={16} />
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">{value}</h3>
                        <span className="text-[10px] font-bold text-slate-400">{unit}</span>
                    </div>
                </div>
            </div>
            {trend && (
                <div className={`flex items-center gap-0.5 text-[9px] font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {trend}
                </div>
            )}
        </div>
    </motion.div>
);

export const Dashboard = ({ language, setActiveTab }: { language: 'en' | 'hi', setActiveTab: (tab: string) => void }) => {
    const t = TRANSLATIONS[language].dashboard;
    const h = TRANSLATIONS[language].hero;
    const [reports, setReports] = useState<any[]>([]);
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [reportsData, weatherData] = await Promise.all([
                    getReports(),
                    getWeather(25.9427, 83.5539)
                ]);
                setReports(reportsData.slice(0, 3));
                setWeather(weatherData);
            } catch (error) {
                console.error("Dashboard load failed", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleComingSoon = (feature: string) => {
        toast.success(`${feature} ${language === 'en' ? 'coming soon!' : 'जल्द आ रहा है!'}`);
    };

    return (
        <div className="space-y-12 pb-20">
            <DisclaimerBanner />

            {/* HERO SECTION - Reverted & Refined */}
            <section className="relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-xl group">
                {/* Background Image (Always present as base/fallback) */}
                <div className="absolute inset-0 bg-slate-900">
                    <img 
                        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80" 
                        alt="Nature Background" 
                        className="w-full h-full object-cover opacity-60"
                        referrerPolicy="no-referrer"
                    />
                </div>
                
                {/* Video Layer */}
                {!videoError && (
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        onError={() => setVideoError(true)}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-clear-water-stream-in-the-forest-4261-large.mp4" type="video/mp4" />
                    </video>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                
                <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 space-y-4 max-w-3xl">
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-[9px] font-bold uppercase tracking-widest w-fit"
                    >
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                        {h.label}
                    </motion.div>
                    
                    <div className="space-y-3">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            className="text-3xl md:text-5xl font-black text-white leading-[1.1] font-display tracking-tight"
                        >
                            {h.titleStart} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                {h.titleEnd}
                            </span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-300 text-sm md:text-base max-w-lg leading-relaxed font-medium"
                        >
                            {h.desc}
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-3"
                    >
                        <button 
                            onClick={() => setActiveTab('analyze')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 group text-xs"
                        >
                            {h.btnPrimary}
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setActiveTab('faq')}
                            className="px-6 py-3 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition-all flex items-center gap-2 text-xs"
                        >
                            <Play size={14} fill="white" />
                            {h.btnSecondary}
                        </button>
                    </motion.div>
                </div>

                {/* Floating Basin Index - Re-styled */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="absolute bottom-10 right-10 p-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl hidden xl:block group-hover:scale-105 transition-transform duration-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                <motion.circle 
                                    cx="50" cy="50" r="45" fill="transparent" stroke="#3b82f6" strokeWidth="8" 
                                    strokeDasharray="282.7"
                                    initial={{ strokeDashoffset: 282.7 }}
                                    animate={{ strokeDashoffset: 282.7 - (282.7 * 84) / 100 }}
                                    transition={{ duration: 2.5, delay: 1 }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-white font-display">84</span>
                                <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest">Index</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Basin Health</p>
                            <p className="text-lg font-black text-white font-display">Excellent</p>
                            <div className="flex items-center gap-1.5 text-emerald-400 text-[8px] font-bold uppercase tracking-widest">
                                <TrendingUp size={10} /> +4.2%
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Average pH" value="7.2" unit="pH" icon={Droplets} trend="+0.2" color="blue" />
                <StatCard label="Total TDS" value="242" unit="mg/L" icon={Activity} trend="-12" color="emerald" />
                <StatCard label="Turbidity" value="1.3" unit="NTU" icon={Waves} trend="+0.1" color="amber" />
                <StatCard label="Water Temp" value="24.5" unit="°C" icon={Thermometer} trend="+1.5" color="red" />
            </div>

            {/* MAIN DASHBOARD CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Charts Section */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display tracking-tight">Water Quality Trends</h3>
                                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Real-time monitoring of Tamsa River parameters.</p>
                            </div>
                            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <button className="px-3 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md text-[9px] font-bold shadow-sm">24H</button>
                                <button className="px-3 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-[9px] font-bold">7D</button>
                                <button className="px-3 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-[9px] font-bold">30D</button>
                            </div>
                        </div>
                        
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                    />
                                    <Area type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPh)" />
                                    <Area type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* System Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 p-6 rounded-[2rem] text-white relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl -mr-12 -mt-12"></div>
                            <div className="relative z-10 space-y-3">
                                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg w-fit border border-blue-500/30">
                                    <ShieldCheck size={16} />
                                </div>
                                <h4 className="text-lg font-black font-display tracking-tight">System Integrity</h4>
                                <p className="text-slate-400 text-[10px] leading-relaxed">All 14 monitoring stations are currently reporting active data. No critical anomalies detected in the last 24 hours.</p>
                                <button 
                                    onClick={() => handleComingSoon(language === 'en' ? 'System Logs' : 'सिस्टम लॉग')}
                                    className="text-blue-400 text-[9px] font-bold flex items-center gap-1.5 hover:text-blue-300 transition-colors uppercase tracking-widest"
                                >
                                    View System Logs <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                        <div className="bg-blue-600 p-6 rounded-[2rem] text-white relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
                            <div className="relative z-10 space-y-3">
                                <div className="p-2 bg-white/10 text-white rounded-lg w-fit border border-white/20">
                                    <Bell size={16} />
                                </div>
                                <h4 className="text-lg font-black font-display tracking-tight">{language === 'en' ? 'Community Impact' : 'सामुदायिक प्रभाव'}</h4>
                                <p className="text-blue-100 text-[10px] leading-relaxed">{language === 'en' ? 'Over 1,200 citizens have contributed reports this month, leading to 4 successful restoration initiatives.' : 'इस महीने 1,200 से अधिक नागरिकों ने रिपोर्ट दी है, जिससे 4 सफल बहाली पहल हुई हैं।'}</p>
                                <button 
                                    onClick={() => setActiveTab('analyze')}
                                    className="text-white text-[9px] font-bold flex items-center gap-1.5 hover:text-blue-100 transition-colors uppercase tracking-widest"
                                >
                                    {language === 'en' ? 'Join The Voice' : 'आवाज उठाएं'} <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Section */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Weather Widget */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-3xl -mr-12 -mt-12"></div>
                        <div className="relative z-10 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Local Weather</p>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">Mau, UP</h4>
                                </div>
                                <div className="text-amber-500">
                                    <Sun size={20} className="animate-spin-slow" />
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-between">
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white font-display">32</span>
                                    <span className="text-base font-bold text-slate-400">°C</span>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-900 dark:text-white">Sunny Day</p>
                                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">H: 34° L: 26°</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <div className="text-center space-y-1">
                                    <Wind size={14} className="mx-auto text-slate-400" />
                                    <p className="text-[9px] font-bold text-slate-900 dark:text-white">12km/h</p>
                                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">Wind</p>
                                </div>
                                <div className="text-center space-y-1">
                                    <Droplets size={14} className="mx-auto text-slate-400" />
                                    <p className="text-[9px] font-bold text-slate-900 dark:text-white">45%</p>
                                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">Humid</p>
                                </div>
                                <div className="text-center space-y-1">
                                    <CloudRain size={14} className="mx-auto text-slate-400" />
                                    <p className="text-[9px] font-bold text-slate-900 dark:text-white">5%</p>
                                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">Rain</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Reports */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">{language === 'en' ? 'Recent Reports' : 'हालिया रिपोर्ट'}</h4>
                            <button 
                                onClick={() => setActiveTab('intel')}
                                className="text-[7px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                            >
                                {language === 'en' ? 'View All' : 'सभी देखें'}
                            </button>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse"></div>)
                            ) : (reports || []).map((report: any, i: number) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: 15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-3 group cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                        {report.imageUrl ? (
                                            <img 
                                                src={report.imageUrl} 
                                                alt="Report" 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <MapPin size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] font-bold text-slate-900 dark:text-white line-clamp-1">{report.location}</p>
                                            <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">2h ago</span>
                                        </div>
                                        <p className="text-[8px] text-slate-500 line-clamp-2 leading-relaxed">{report.description}</p>
                                        <div className={`mt-1 px-1.5 py-0.5 rounded text-[6px] font-bold uppercase tracking-widest w-fit ${
                                            report.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            {report.status}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => handleComingSoon(language === 'en' ? 'Map Layers' : 'मानचित्र परतें')}
                            className="p-4 bg-slate-900 rounded-[1.5rem] text-white flex flex-col items-center gap-2 hover:bg-slate-800 transition-all shadow-lg group"
                        >
                            <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                                <Layers size={16} />
                            </div>
                            <span className="text-[7px] font-bold uppercase tracking-widest">Layers</span>
                        </button>
                        <button 
                            onClick={() => handleComingSoon(language === 'en' ? 'Search' : 'खोजें')}
                            className="p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] text-slate-900 dark:text-white flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
                        >
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                <Search size={16} />
                            </div>
                            <span className="text-[7px] font-bold uppercase tracking-widest">Search</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
