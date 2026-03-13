import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Wind, Droplet, ArrowRight, Camera, AlertCircle, CheckCircle2, Clock, Mic, ChevronRight, Volume2, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { getQuickStat } from '../lib/gemini';
import { WaterQualityReport } from '../types';
import { TRANSLATIONS } from '../constants';
import { motion } from 'framer-motion';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { MockPill } from './ui/MockPill';
import { useAuth } from '../src/AuthContext';

interface DashboardProps {
    onChangeTab: (tab: string) => void;
    language: 'en' | 'hi';
}

export const Dashboard: React.FC<DashboardProps> = ({ onChangeTab, language }) => {
    const { user } = useAuth();
    const [reports, setReports] = useState<WaterQualityReport[]>([]);
    const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);
    const [weather, setWeather] = useState<any>(null);
    const [systemSummary, setSystemSummary] = useState("Initializing regional data streams...");
    const [loading, setLoading] = useState(true);
    
    const t = TRANSLATIONS[language];

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch critical data first
                const [reportData, trendData, weatherData] = await Promise.all([
                    user ? api.getReports().catch(e => {
                        // Suppress expected permission errors when unauthenticated
                        return [];
                    }) : Promise.resolve([]),
                    api.getWaterTrends(),
                    api.getWeather(25.9427, 83.5539) // Default Mau, UP coordinates
                ]);
                
                setReports(reportData);
                setChartData(trendData);
                setWeather(weatherData);
                setLoading(false); // Stop loading immediately after core data

                // 2. Fetch system summary in background
                if (reportData.length > 0) {
                    const latest = reportData[0];
                    const context = `Latest report from ${latest.locationName} shows ${latest.overallScore}/100 score. Algae: ${latest.algaeLevel}. Status: ${latest.status}.`;
                    
                    // Non-blocking system call
                    getQuickStat(context).then(summary => {
                        if (summary) setSystemSummary(summary);
                    }).catch(err => console.error("Summary failed", err));
                }
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    const getStatusColor = (score: number) => {
        if (score < 50) return 'border-l-4 border-l-red-500';
        if (score < 75) return 'border-l-4 border-l-amber-500';
        return 'border-l-4 border-l-emerald-500';
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

  return (
    <div className="space-y-10 pt-4">
      {/* 1. HERO SECTION (Refined & Hooking) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white min-h-[480px] flex items-center shadow-2xl group">
          {/* High-quality background image with overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
            <img 
              src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1920&q=80" 
              alt="Mountain landscape"
              className="w-full h-full object-cover opacity-60 scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
          </div>

          <div className="relative z-10 w-full px-8 md:px-16 py-12">
            <div className="max-w-3xl space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">{t.hero.label}</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl md:text-6xl font-bold leading-[0.95] font-display tracking-tight"
                >
                    {t.hero.titleStart} <br/>
                    <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{t.hero.titleEnd}</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="text-slate-400 text-xl md:text-2xl max-w-xl font-light leading-relaxed"
                >
                    {t.hero.desc}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-5 pt-4"
                >
                    <button 
                        onClick={() => onChangeTab('analyze')}
                        className="h-16 px-10 bg-white text-slate-950 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {t.dashboard.submitReport}
                        <ArrowRight size={22} />
                    </button>
                    <button 
                        onClick={() => onChangeTab('admin')}
                        className="h-16 px-10 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center"
                    >
                        {t.hero.btnSecondary}
                    </button>
                </motion.div>

                {/* Login Prompt for better UX */}
                {!user && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="pt-4 flex items-center gap-3 text-white/60 text-sm"
                    >
                        <AlertCircle size={16} className="text-blue-400" />
                        <span>Sign in to unlock personalized water quality alerts and AI insights.</span>
                    </motion.div>
                )}
            </div>
          </div>
          
          {/* Subtle floating element for "fanciness" */}
          <div className="absolute right-16 bottom-16 hidden xl:block">
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                  <Droplet size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Live Basin Index</div>
                  <div className="text-3xl font-bold text-white font-mono">92.4</div>
                </div>
              </div>
              <div className="h-2 w-56 bg-white/5 rounded-full overflow-hidden p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                ></motion.div>
              </div>
            </motion.div>
          </div>
      </div>

      {/* 2. DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Insight - Spans 2 cols */}
          <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Activity size={18} className="text-blue-600" />
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">System Analysis</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                        {loading ? "Loading data..." : systemSummary}
                    </p>
                </div>
                <button onClick={() => onChangeTab('analyze')} className="text-xs font-bold text-gov-teal hover:underline flex items-center gap-1">
                    {t.dashboard.viewReport} <ArrowRight size={14} />
                </button>
              </div>
              <div className="w-full md:w-48 h-32 md:h-auto rounded-xl overflow-hidden shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=400&q=80" 
                    alt="Water Analysis" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
              </div>
          </div>

          {/* Quick Action: Report */}
          <div 
            onClick={() => onChangeTab('analyze')}
            className="md:col-span-1 lg:col-span-1 bg-gov-teal rounded-2xl p-5 shadow-sm text-white cursor-pointer hover:bg-teal-600 transition-colors flex flex-col justify-between min-h-[160px]"
          >
              <Camera size={24} />
              <div>
                  <h3 className="font-bold text-lg mb-1">{t.dashboard.submitReport}</h3>
                  <p className="text-white/80 text-xs">{t.dashboard.uploadPhoto}</p>
              </div>
          </div>

          {/* Stat Card 1 */}
          <div className="md:col-span-1 lg:col-span-1">
            <StatCard label="Water Index" value="92" trend="Excellent" icon={Droplet} color="emerald" />
          </div>

          {/* Weather Card - Integrated from Open-Meteo */}
          {weather && (
            <div className="md:col-span-1 lg:col-span-1">
              <StatCard 
                label="Air Temp" 
                value={`${Math.round(weather.current.temperature_2m)}°C`} 
                trend={weather.current.precipitation > 0 ? "Raining" : "Clear"} 
                icon={Wind} 
                color="blue" 
              />
            </div>
          )}

          {/* Main Chart - Spans 2 cols */}
          <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">{t.dashboard.chartTitle}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Index Trend</span>
                </div>
                <div className="flex-1 w-full min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#94a3b8'}} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#94a3b8'}} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#0A3D6B" 
                            strokeWidth={2} 
                            fill="#0A3D6B" 
                            fillOpacity={0.1}
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
          </div>

          {/* Recent Activity - Spans 2 cols */}
          <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">{t.dashboard.recentReports}</h3>
                  <button className="text-[10px] font-bold text-gov-teal hover:underline uppercase">View All</button>
              </div>
              
              <div className="space-y-2 flex-1">
                {loading ? (
                    [1,2].map(i => <SkeletonReport key={i} />)
                ) : (
                    reports.slice(0, 2).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${report.overallScore < 50 ? 'bg-red-500' : report.overallScore < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                    {report.overallScore}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{report.locationName}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                            <Clock size={8} />
                                            {new Date(report.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <span className={`text-[9px] font-bold ${report.status === 'Resolved' ? 'text-emerald-500' : 'text-amber-500'}`}>{report.status}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-400" />
                        </div>
                    ))
                )}
              </div>
          </div>

      </div>
      
      <div className="pt-8 opacity-50">
        <DisclaimerBanner />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => {
    return (
        <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-full group"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-gov-teal group-hover:bg-gov-teal group-hover:text-white transition-colors duration-300">
                    <Icon size={24} />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 mb-1">
                        {trend}
                    </span>
                    <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-1 h-3 bg-emerald-500/20 rounded-full overflow-hidden">
                                <motion.div 
                                    animate={{ height: ["20%", "100%", "20%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-full bg-emerald-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white font-display mb-1 tracking-tight">{value}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{label}</p>
            </div>
        </motion.div>
    );
};

const SkeletonReport = () => (
    <div className="group flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 border border-transparent rounded-2xl animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
        </div>
        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gov-card/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 ring-1 ring-black/5 dark:ring-white/5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-lg font-bold text-gov-navy dark:text-white font-display">
                    {payload[0].value} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Index</span>
                </p>
            </div>
        );
    }
    return null;
};