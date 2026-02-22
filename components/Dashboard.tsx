import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Wind, Droplet, ArrowRight, Camera, AlertCircle, CheckCircle2, Clock, Mic, ChevronRight } from 'lucide-react';
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
                const [reportData, trendData] = await Promise.all([
                    api.getReports(),
                    api.getWaterTrends()
                ]);
                
                setReports(reportData);
                setChartData(trendData);
                
                // Generate AI Summary based on real data
                if (reportData.length > 0) {
                    const latest = reportData[0];
                    const context = `Latest report from ${latest.locationName} shows ${latest.overallScore}/100 score. Algae: ${latest.algaeLevel}. Status: ${latest.status}.`;
                    const summary = await getQuickStat(context);
                    setAiSummary(summary || "Monitoring active. Systems normal.");
                }
            } catch (e) {
                console.error(e);
            } finally {
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
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-[#0B1F3B] text-white p-8 md:p-12 shadow-2xl shadow-blue-900/20">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1CA7A6] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600 rounded-full blur-[100px] opacity-20 translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-[#1CA7A6] animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{t.hero.label}</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] font-display">
                    {t.hero.titleStart} <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1CA7A6] to-emerald-400">{t.hero.titleEnd}</span>
                </h1>
                
                <p className="text-blue-100/80 text-lg leading-relaxed max-w-lg font-light">
                    {t.hero.desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                        onClick={onOpenAssistant}
                        className="h-12 px-6 bg-white text-[#0B1F3B] rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Mic size={18} className="group-hover:text-[#1CA7A6] transition-colors" />
                        {t.hero.btnPrimary}
                    </button>
                    <button 
                        onClick={() => onChangeTab('admin')}
                        className="h-12 px-6 bg-transparent border border-white/20 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        {t.hero.btnSecondary}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:flex justify-end">
                <div className="relative w-80 h-80">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/10 rotate-3 transform transition-transform hover:rotate-0 duration-500"></div>
                    <div className="absolute inset-0 bg-[#0f2545] rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col justify-between -rotate-3 transform transition-transform hover:rotate-0 duration-500">
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
                                <div className="h-full bg-[#1CA7A6] w-[70%] rounded-full"></div>
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
                                 <div className="text-2xl font-bold text-[#1CA7A6] font-display">A+</div>
                                 <div className="text-[10px] text-white/40 uppercase">Quality</div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      </motion.div>

      {/* 2. BENTO GRID DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* AI Insight - Spans 2 cols */}
          <motion.div variants={item} className="md:col-span-2 lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 font-display">{t.dashboard.aiAnalysis}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">
                    {loading ? "Analyzing sensor streams..." : aiSummary}
                </p>
                <button onClick={() => onChangeTab('analyze')} className="text-sm font-semibold text-[#1CA7A6] hover:text-teal-700 flex items-center gap-1 group/btn">
                    {t.dashboard.viewReport} <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
          </motion.div>

          {/* Quick Action: Report */}
          <motion.div 
            variants={item}
            onClick={() => onChangeTab('analyze')}
            className="bg-[#1CA7A6] rounded-3xl p-6 shadow-lg shadow-teal-900/10 text-white cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group"
          >
              <div className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform duration-500">
                  <Camera size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="p-2 bg-white/20 w-fit rounded-lg backdrop-blur-sm">
                      <Camera size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-xl font-display mb-1">{t.dashboard.submitReport}</h3>
                      <p className="text-white/80 text-sm">{t.dashboard.uploadPhoto}</p>
                  </div>
              </div>
          </motion.div>

          {/* Stat Card 1 */}
          <motion.div variants={item}>
            <StatCard label="Dissolved Oxygen" value="5.2 mg/L" trend="Stable" icon={Wind} color="blue" />
          </motion.div>
          
          {/* Stat Card 2 */}
          <motion.div variants={item}>
            <StatCard label="Turbidity" value="32 NTU" trend="Improving" icon={Droplet} color="cyan" />
          </motion.div>

          {/* Main Chart - Spans 2 cols */}
          <motion.div variants={item} className="md:col-span-2 lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800 font-display">{t.dashboard.chartTitle}</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t.dashboard.chartSub}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0B1F3B]"></span>
                        <span className="text-xs text-slate-500">Index</span>
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0B1F3B" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0B1F3B" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} 
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}} />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#0B1F3B" 
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
          <motion.div variants={item} className="md:col-span-2 lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 font-display">{t.dashboard.recentReports}</h3>
                  <button className="text-xs font-bold text-slate-400 hover:text-[#0B1F3B] uppercase tracking-wider transition-colors">View All</button>
              </div>
              
              <div className="space-y-3 flex-1">
                {loading ? (
                    [1,2].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>)
                ) : (
                    reports.slice(0, 3).map((report) => (
                        <div key={report.id} className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-md cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${report.overallScore < 50 ? 'bg-red-500' : report.overallScore < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                    {report.overallScore}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">{report.locationName}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(report.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-[10px] font-medium text-slate-500">{report.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-[#0B1F3B] transition-colors" />
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
        blue: 'bg-blue-50 text-blue-600',
        cyan: 'bg-cyan-50 text-cyan-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600'
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
                    <Icon size={20} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend === 'Stable' || trend === 'Improving' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-900 font-display mb-1">{value}</h3>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 ring-1 ring-black/5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-lg font-bold text-[#0B1F3B] font-display">
                    {payload[0].value} <span className="text-xs font-medium text-slate-500">Index</span>
                </p>
            </div>
        );
    }
    return null;
};