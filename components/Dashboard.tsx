import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Wind, Droplet, ArrowRight, Camera, AlertCircle, CheckCircle2, Clock, Mic, ChevronRight, Volume2 } from 'lucide-react';
import { api } from '../services/api';
import { getQuickStat } from '../services/geminiService';
import { WaterQualityReport } from '../types';
import { TRANSLATIONS } from '../constants';
import { motion } from 'motion/react';

interface DashboardProps {
    onChangeTab: (tab: string) => void;
    onOpenAssistant: () => void;
    language: 'en' | 'hi';
}

export const Dashboard: React.FC<DashboardProps> = ({ onChangeTab, onOpenAssistant, language }) => {
    const [reports, setReports] = useState<WaterQualityReport[]>([]);
    const [chartData, setChartData] = useState<{name: string, value: number}[]>([]);
    const [aiSummary, setAiSummary] = useState("Initializing regional data streams...");
    const [loading, setLoading] = useState(true);
    
    const t = TRANSLATIONS[language];

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch critical data first
                const [reportData, trendData] = await Promise.all([
                    api.getReports(),
                    api.getWaterTrends()
                ]);
                
                setReports(reportData);
                setChartData(trendData);
                setLoading(false); // Stop loading immediately after core data

                // 2. Fetch AI summary in background
                if (reportData.length > 0) {
                    const latest = reportData[0];
                    const context = `Latest report from ${latest.locationName} shows ${latest.overallScore}/100 score. Algae: ${latest.algaeLevel}. Status: ${latest.status}.`;
                    
                    // Non-blocking AI call
                    getQuickStat(context).then(summary => {
                        if (summary) setAiSummary(summary);
                    }).catch(err => console.error("AI Summary failed", err));
                }
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        loadData();
    }, []);

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
    <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 pt-6"
    >
      
      {/* 1. HERO SECTION (Modern & Clean) */}
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gov-navy dark:bg-gov-dark-navy text-white p-8 md:p-12 shadow-subtle-hover water-ripple-bg">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gov-teal rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600 rounded-full blur-[100px] opacity-20 translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-gov-teal animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{t.hero.label}</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] font-display">
                    {t.hero.titleStart} <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gov-teal to-emerald-400">{t.hero.titleEnd}</span>
                </h1>
                
                <p className="text-blue-100/80 text-lg leading-relaxed max-w-lg font-light">
                    {t.hero.desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                        onClick={onOpenAssistant}
                        className="h-12 px-6 bg-white text-gov-navy rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Mic size={18} className="group-hover:text-gov-teal transition-colors" />
                        {t.hero.btnPrimary}
                    </button>
                    <button 
                        onClick={() => onChangeTab('admin')}
                        className="h-12 px-6 bg-transparent border border-white/20 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        {t.hero.btnSecondary}
                        <ArrowRight size={18} />
                    </button>
                    <button 
                        onClick={() => document.dispatchEvent(new CustomEvent('open-starter-guide'))}
                        className="h-12 px-6 bg-gov-teal/20 border border-gov-teal/50 text-white rounded-xl font-medium hover:bg-gov-teal/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Volume2 size={18} />
                        {language === 'en' ? 'Starter Guide' : 'शुरुआती गाइड'}
                    </button>
                </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:flex justify-end">
                <div className="relative w-80 h-80">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/10 rotate-3 transform transition-transform hover:rotate-0 duration-500"></div>
                    <div className="absolute inset-0 bg-[#0f2545] dark:bg-slate-900 rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col justify-between -rotate-3 transform transition-transform hover:rotate-0 duration-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 uppercase tracking-wider font-bold">Status</div>
                                    <div className="text-sm font-semibold text-white">Monitoring Active</div>
                                </div>
                            </div>
                            <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                98% Uptime
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gov-teal w-[70%] rounded-full"></div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[45%] rounded-full"></div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[60%] rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                             <div className="text-center">
                                 <div className="text-2xl font-bold text-white font-display">24</div>
                                 <div className="text-[10px] text-white/40 uppercase">Sensors</div>
                             </div>
                             <div className="w-[1px] h-8 bg-white/10"></div>
                             <div className="text-center">
                                 <div className="text-2xl font-bold text-white font-display">12</div>
                                 <div className="text-[10px] text-white/40 uppercase">Alerts</div>
                             </div>
                             <div className="w-[1px] h-8 bg-white/10"></div>
                             <div className="text-center">
                                 <div className="text-2xl font-bold text-gov-teal font-display">A+</div>
                                 <div className="text-[10px] text-white/40 uppercase">Quality</div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      </motion.div>

      {/* 2. BENTO GRID DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* AI Insight - Spans 2 cols */}
          <motion.div variants={item} className="md:col-span-2 lg:col-span-2 bg-gov-light-surface dark:bg-gov-dark-navy/80 dark:backdrop-blur-xl rounded-3xl p-6 shadow-subtle border border-blue-100 dark:border-white/10 hover:shadow-subtle-hover transition-shadow relative overflow-hidden group flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-gov-teal/20 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white font-display">{t.dashboard.aiAnalysis}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {loading ? "Analyzing sensor streams..." : aiSummary}
                </p>
              </div>
              <button onClick={() => onChangeTab('analyze')} className="relative z-10 text-sm font-semibold text-gov-teal hover:text-teal-700 dark:hover:text-teal-400 flex items-center gap-1 group/btn w-fit">
                  {t.dashboard.viewReport} <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
          </motion.div>

          {/* Quick Action: Report */}
          <motion.div 
            variants={item}
            onClick={() => onChangeTab('analyze')}
            className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-gov-teal to-blue-600 rounded-3xl p-6 shadow-subtle shadow-teal-900/20 text-white cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group flex flex-col justify-between min-h-[200px]"
          >
              <div className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform duration-500">
                  <Camera size={120} />
              </div>
              <div className="relative z-10">
                  <div className="p-2 bg-white/20 w-fit rounded-xl backdrop-blur-sm mb-4">
                      <Camera size={24} />
                  </div>
              </div>
              <div className="relative z-10">
                  <h3 className="font-bold text-xl font-display mb-1">{t.dashboard.submitReport}</h3>
                  <p className="text-white/80 text-sm">{t.dashboard.uploadPhoto}</p>
              </div>
          </motion.div>

          {/* Stat Card 1 */}
          <motion.div variants={item} className="md:col-span-1 lg:col-span-1">
            <StatCard label="Water Quality Index" value="92" trend="Excellent" icon={Droplet} color="emerald" />
          </motion.div>

          {/* Main Chart - Spans 2 cols */}
          <motion.div variants={item} className="md:col-span-2 lg:col-span-2 bg-gov-light-surface dark:bg-gov-dark-navy/80 dark:backdrop-blur-xl rounded-3xl p-6 shadow-subtle border border-blue-100 dark:border-white/10 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white font-display">{t.dashboard.chartTitle}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{t.dashboard.chartSub}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="w-2 h-2 rounded-full bg-gov-navy dark:bg-blue-500"></span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Index</span>
                    </div>
                </div>
                <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0A3D6B" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0A3D6B" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} 
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}} />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#0A3D6B" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            animationDuration={1500}
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
          </motion.div>

          {/* Recent Activity - Spans 2 cols */}
          <motion.div variants={item} className="md:col-span-2 lg:col-span-2 bg-gov-light-surface dark:bg-gov-dark-navy/80 dark:backdrop-blur-xl rounded-3xl p-6 shadow-subtle border border-blue-100 dark:border-white/10 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-white font-display">{t.dashboard.recentReports}</h3>
                  <button className="text-xs font-bold text-gov-teal hover:text-teal-700 dark:hover:text-teal-400 uppercase tracking-wider transition-colors flex items-center gap-1">View All <ArrowRight size={14}/></button>
              </div>
              
              <div className="space-y-3 flex-1">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-16 bg-blue-50 dark:bg-slate-700/50 rounded-2xl animate-pulse"></div>)
                ) : (
                    reports.slice(0, 3).map((report) => (
                        <div key={report.id} className="group flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-blue-200 dark:hover:border-slate-600 rounded-2xl transition-all duration-300 hover:shadow-md cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${report.overallScore < 50 ? 'bg-red-500 shadow-red-500/30' : report.overallScore < 75 ? 'bg-amber-500 shadow-amber-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
                                    {report.overallScore}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{report.locationName}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(report.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-500"></span>
                                        <span className={`text-[10px] font-bold ${report.status === 'Resolved' ? 'text-emerald-500' : report.status === 'Pending' ? 'text-red-500' : 'text-amber-500'}`}>{report.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <ChevronRight size={18} className="text-slate-300 dark:text-slate-500 group-hover:text-gov-navy dark:group-hover:text-white transition-colors group-hover:translate-x-1" />
                            </div>
                        </div>
                    ))
                )}
              </div>
          </motion.div>

      </div>
    </motion.div>
  );
};

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400',
        amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
    };

    return (
        <div className="bg-gov-light-surface dark:bg-gov-dark-navy/80 dark:backdrop-blur-xl p-6 rounded-3xl border border-blue-100 dark:border-white/10 shadow-subtle flex flex-col justify-between hover:shadow-subtle-hover transition-shadow h-full group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color] || colorClasses['blue']} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${trend === 'Stable' || trend === 'Improving' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-1">{value}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
};

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