import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertTriangle, ShieldAlert, ShieldCheck, Info, MessageSquare, Volume2, Loader2, Search, X } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { playBrowserTTS, searchWaterNews } from '../lib/claude';

const stateRisks: Record<string, { risk: 'critical' | 'high' | 'medium' | 'low', issues: string[], color: string }> = {
  "West Bengal":    { risk: "critical", issues: ["Arsenic", "Iron"], color: "#dc2626" },
  "Bihar":          { risk: "critical", issues: ["Arsenic", "Iron", "Fluoride"], color: "#dc2626" },
  "Jharkhand":      { risk: "critical", issues: ["Arsenic", "Iron"], color: "#dc2626" },
  "Assam":          { risk: "high",     issues: ["Arsenic", "Fluoride"], color: "#ea580c" },
  "Rajasthan":      { risk: "critical", issues: ["Fluoride", "High TDS"], color: "#dc2626" },
  "Andhra Pradesh": { risk: "high",     issues: ["Fluoride", "TDS"], color: "#ea580c" },
  "Telangana":      { risk: "high",     issues: ["Fluoride", "TDS"], color: "#ea580c" },
  "Punjab":         { risk: "high",     issues: ["Pesticides", "Uranium"], color: "#ea580c" },
  "Haryana":        { risk: "high",     issues: ["Nitrates", "Salinity"], color: "#ea580c" },
  "Gujarat":        { risk: "medium",   issues: ["Fluoride", "Salinity"], color: "#d97706" },
  "Uttar Pradesh":  { risk: "medium",   issues: ["TDS", "Hardness"], color: "#d97706" },
  "Madhya Pradesh": { risk: "medium",   issues: ["Fluoride", "TDS"], color: "#d97706" },
  "Maharashtra":    { risk: "low",      issues: ["Seasonal turbidity"], color: "#16a34a" },
  "Karnataka":      { risk: "low",      issues: ["Fluoride in some districts"], color: "#16a34a" },
  "Tamil Nadu":     { risk: "medium",   issues: ["Saltwater intrusion", "TDS"], color: "#d97706" },
  "Kerala":         { risk: "low",      issues: ["Generally safe"], color: "#16a34a" },
  "Odisha":         { risk: "medium",   issues: ["Iron", "Fluoride"], color: "#d97706" },
  "Chhattisgarh":   { risk: "medium",   issues: ["Fluoride", "Iron"], color: "#d97706" },
  "Himachal Pradesh":{ risk: "low",     issues: ["Generally safe"], color: "#16a34a" },
  "Uttarakhand":    { risk: "low",      issues: ["Generally safe"], color: "#16a34a" },
  "Delhi":          { risk: "medium",   issues: ["TDS", "Heavy metals"], color: "#d97706" },
};

export const WaterMap = ({ language = 'en' }: { language?: 'en' | 'hi' }) => {
  const t = TRANSLATIONS[language].map;
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const handleStateSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    console.log('[WaterMap] Searching for state/region intelligence', { searchQuery });
    try {
      const result = await searchWaterNews(`Current water quality and contamination issues in ${searchQuery} India 2024 2025`);
      console.log('[WaterMap] Search successful', result);
      setSearchResult(result.text);
    } catch (error) {
      console.error("[WaterMap] Search failed:", error);
      setSearchResult("Unable to fetch real-time data for this region. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSpeak = (state: string, data: any) => {
    if (isSpeaking === state) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    const text = `${state} has a ${data.risk} water risk level. Key issues include ${data.issues.join(', ')}.`;
    setIsSpeaking(state);
    playBrowserTTS(
      text,
      () => setIsSpeaking(state),
      () => setIsSpeaking(null)
    );
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const filteredStates = Object.entries(stateRisks).filter(([_, data]) => {
    if (filter === 'all') return true;
    return data.risk === filter;
  });

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical': return <ShieldAlert size={18} className="text-red-600 dark:text-red-400" />;
      case 'high': return <AlertTriangle size={18} className="text-orange-600 dark:text-orange-400" />;
      case 'medium': return <Info size={18} className="text-amber-600 dark:text-amber-400" />;
      case 'low': return <ShieldCheck size={18} className="text-green-600 dark:text-green-400" />;
      default: return null;
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50';
      case 'high': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50';
      case 'medium': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50';
      case 'low': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50';
      default: return '';
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto pt-6"
    >
      <DisclaimerBanner />
      <div className="bg-gov-card dark:bg-slate-900 rounded-[2rem] shadow-subtle dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 dark:border-slate-800 bg-gov-bg dark:bg-slate-800/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-2xl">
                <MapPin size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">{t.title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t.subtitle}</p>
            </div>
          </div>
          
          {/* Legend & Filters */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-full shadow-inner border border-slate-200/50 dark:border-slate-700/50">
              <FilterBtn label={t.all} active={filter === 'all'} onClick={() => setFilter('all')} color="from-slate-400 to-slate-500" />
              <FilterBtn label={t.critical} active={filter === 'critical'} onClick={() => setFilter('critical')} color="from-red-500 to-rose-600" />
              <FilterBtn label={t.high} active={filter === 'high'} onClick={() => setFilter('high')} color="from-orange-500 to-amber-600" />
              <FilterBtn label={t.medium} active={filter === 'medium'} onClick={() => setFilter('medium')} color="from-amber-400 to-yellow-500" />
              <FilterBtn label={t.low} active={filter === 'low'} onClick={() => setFilter('low')} color="from-emerald-400 to-green-500" />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search state/region..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStateSearch()}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button 
                onClick={handleStateSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 bg-gov-navy dark:bg-blue-600 text-white text-sm font-bold rounded-full hover:scale-105 transition-all disabled:bg-slate-300"
              >
                {isSearching ? <Loader2 className="animate-spin" size={16} /> : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Result Overlay */}
        <AnimatePresence>
          {searchResult && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-8 md:px-10 pb-8"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-800/50 relative">
                <button 
                  onClick={() => setSearchResult(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-xl text-blue-600 dark:text-blue-400">
                    <Search size={20} />
                  </div>
                  <h3 className="font-bold text-lg">Real-time Intelligence: {searchQuery}</h3>
                  <button 
                    onClick={() => handleSpeak(searchQuery, { risk: 'search', issues: [searchResult] })}
                    className={`p-2 rounded-full transition-all ${isSpeaking === searchQuery ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-100'}`}
                  >
                    {isSpeaking === searchQuery ? <Loader2 className="animate-spin" size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                  {searchResult}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State Cards List */}
        <div className="p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStates.map(([state, data]) => (
                <motion.div 
                key={state}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-4 md:p-6 rounded-2xl border ${getRiskBg(data.risk)} flex flex-col justify-between h-full`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white font-display">{state}</h3>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleSpeak(state, data)}
                        className={`p-1.5 rounded-lg backdrop-blur-sm border transition-all ${isSpeaking === state ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-300 border-transparent hover:bg-white/80'}`}
                      >
                        {isSpeaking === state ? <Loader2 className="animate-spin" size={14} /> : <Volume2 size={14} />}
                      </button>
                      <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm">
                        {getRiskIcon(data.risk)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{t.keyIssues}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.issues.map(issue => (
                        <span key={issue} className="px-2 py-0.5 bg-white/60 dark:bg-black/30 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterBtn = ({ label, active, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`relative px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${active ? 'text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
  >
    {active && (
      <motion.div
        layoutId="map-filter-active"
        className={`absolute inset-0 rounded-full -z-10 bg-gradient-to-r ${color} shadow-lg`}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
    )}
    <span className="font-display">{label}</span>
  </button>
);
