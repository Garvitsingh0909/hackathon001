import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Wind, Droplet, ArrowRight, Camera, AlertCircle, CheckCircle2, Clock, Mic, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { getQuickStat } from '../services/geminiService';
import { WaterQualityReport } from '../types';
import { TRANSLATIONS } from '../constants';

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

  return (
    <div className="space-y-12 animate-slide-up">
      
      {/* 1. HERO SECTION (Governance Design) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 md:px-0 pt-4 md:pt-0">
          <div className="space-y-6">
              <div className="inline-block">
                  <span className="text-[#1CA7A6] font-bold uppercase tracking-widest text-xs mb-2 block">
                      {t.hero.label}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                      {t.hero.titleStart} <span className="text-[#0B1F3B]">{t.hero.titleEnd}</span>
                  </h1>
              </div>
              
              <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
                  {t.hero.desc}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                      onClick={onOpenAssistant}
                      className="h-14 px-8 bg-[#0B1F3B] text-white rounded-xl font-medium shadow-lg hover:translate-y-[-2px] hover:shadow-xl transition-all btn-press flex items-center justify-center gap-3"
                  >
                      <Mic size={20} className="animate-pulse" />
                      {t.hero.btnPrimary}
                  </button>
                  <button 
                      onClick={() => onChangeTab('admin')}
                      className="h-14 px-8 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all btn-press flex items-center justify-center gap-2"
                  >
                      {t.hero.btnSecondary}
                      <ArrowRight size={18} />
                  </button>
              </div>
          </div>

          {/* Hero Visual / Illustration area */}
          <div className="hidden lg:flex justify-center items-center relative h-[400px]">
              {/* Abstract decorative elements */}
              <div className="absolute w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10 top-0 right-0"></div>
              <div className="absolute w-72 h-72 bg-teal-100/30 rounded-full blur-3xl -z-10 bottom-0 left-10"></div>
              
              <div className="relative z-10 p-8 border border-white/40 bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl">
                  {/* Minimal Interface Mockup */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm w-80 space-y-4 border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <div className="w-2 h-4 bg-blue-600 rounded-full animate-[bounce_1s_infinite]"></div>
                                <div className="w-2 h-6 bg-blue-600 rounded-full animate-[bounce_1.2s_infinite] mx-1"></div>
                                <div className="w-2 h-3 bg-blue-600 rounded-full animate-[bounce_0.8s_infinite]"></div>
                            </div>
                            <div>
                                <div className="h-2 w-24 bg-slate-200 rounded mb-1"></div>
                                <div className="h-2 w-16 bg-slate-100 rounded"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <div className="p-3 bg-slate-50 rounded-lg rounded-tl-none text-xs text-slate-600">
                                Reporting high turbidity near Ghat 4.
                             </div>
                             <div className="p-3 bg-blue-600 text-white rounded-lg rounded-tr-none text-xs ml-auto w-fit">
                                Report logged. Reference #402.
                             </div>
                        </div>
                        <div className="pt-2 flex justify-center">
                            <div className="w-12 h-12 rounded-full border-2 border-[#1CA7A6]/20 flex items-center justify-center">
                                <div className="w-8 h-8 bg-[#1CA7A6] rounded-full animate-ripple opacity-50 absolute"></div>
                                <Mic size={20} className="text-[#1CA7A6] relative z-10" />
                            </div>
                        </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. LIVE DASHBOARD DATA */}
      <div className="pt-8 border-t border-slate-200">
          <div className="flex justify-between items-end mb-8 px-4 md:px-0">
              <div>
                  <h2 className="text-xl font-bold text-slate-900">{t.dashboard.liveMonitor}</h2>
                  <p className="text-slate-500 text-sm mt-1">{t.dashboard.liveMonitorSub}</p>
              </div>
              <div className="hidden md:flex gap-2">
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        {t.dashboard.systemOp}
                   </div>
              </div>
          </div>

          {/* AI Insight Bar */}
          <div className="bg-white mx-4 md:mx-0 p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="p-2.5 bg-blue-50 text-[#0B1F3B] rounded-lg shrink-0">
                  <Activity size={20} />
              </div>
              <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{t.dashboard.aiAnalysis}</h3>
                  <p className="text-slate-600 text-sm">
                      {loading ? "Analyzing sensor streams..." : aiSummary}
                  </p>
              </div>
              <button onClick={() => onChangeTab('analyze')} className="text-sm font-medium text-[#1CA7A6] hover:text-teal-700 whitespace-nowrap flex items-center gap-1">
                  {t.dashboard.viewReport} <ChevronRight size={16} />
              </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{t.dashboard.chartTitle}</h3>
                        <p className="text-xs text-slate-400">{t.dashboard.chartSub}</p>
                    </div>
                </div>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0B1F3B" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#0B1F3B" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}}
                            cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
                        />
                        <Area type="monotone" dataKey="value" stroke="#0B1F3B" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Stats Column */}
            <div className="space-y-4">
                 <h3 className="font-bold text-slate-800 text-sm mb-4">{t.dashboard.keyParams}</h3>
                 <StatCard label="Dissolved Oxygen" value="5.2 mg/L" trend="Stable" icon={Wind} color="blue" />
                 <StatCard label="Turbidity" value="32 NTU" trend="Improving" icon={Droplet} color="cyan" />
                 <StatCard label="Pending Alerts" value="3" trend="Action Req." icon={AlertCircle} color="amber" />
                 
                 <div className="bg-[#0B1F3B] p-5 rounded-2xl text-white mt-4 relative overflow-hidden group cursor-pointer" onClick={() => onChangeTab('analyze')}>
                    <div className="relative z-10">
                        <Camera className="mb-3 text-[#1CA7A6]" size={24} />
                        <h4 className="font-bold text-lg">{t.dashboard.submitReport}</h4>
                        <p className="text-white/60 text-xs mt-1">{t.dashboard.uploadPhoto}</p>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                 </div>
            </div>
          </div>
      </div>
      
      {/* Recent Activity List */}
      <div className="px-4 md:px-0">
          <h3 className="font-bold text-slate-800 text-lg mb-4">{t.dashboard.recentReports}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
                [1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>)
            ) : (
                reports.slice(0, 3).map((report) => (
                    <div key={report.id} className={`p-4 bg-white border border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow relative overflow-hidden ${getStatusColor(report.overallScore)}`}>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <h4 className="font-semibold text-slate-900 text-sm truncate pr-2">{report.locationName}</h4>
                            <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">{report.status}</span>
                        </div>
                        <div className="flex justify-between items-end relative z-10 mt-4">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={12} />
                                {new Date(report.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="text-right">
                                <span className={`text-xl font-bold ${report.overallScore < 50 ? 'text-red-600' : 'text-slate-700'}`}>{report.overallScore}</span>
                                <span className="text-[10px] text-slate-400 block -mt-1">Health Index</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700',
        cyan: 'bg-cyan-50 text-cyan-700',
        amber: 'bg-amber-50 text-amber-700',
        emerald: 'bg-emerald-50 text-emerald-700'
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color] || 'bg-slate-50 text-slate-700'}`}>
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
                    <h3 className="text-lg font-bold text-slate-900">{value}</h3>
                </div>
            </div>
            <span className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-1 rounded">
                {trend}
            </span>
        </div>
    );
};