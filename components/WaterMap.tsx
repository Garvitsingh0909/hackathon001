import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, AlertTriangle, ShieldAlert, ShieldCheck, Info, MessageSquare } from 'lucide-react';

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

export const WaterMap = ({ onGetAdvice }: { onGetAdvice: (state: string) => void }) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

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
      <div className="bg-gov-card dark:bg-slate-900 rounded-[2rem] shadow-subtle dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 dark:border-slate-800 bg-gov-bg dark:bg-slate-800/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-2xl">
                <MapPin size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">India Water Risk Map</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Regional water quality concerns and contaminants</p>
            </div>
          </div>
          
          {/* Legend & Filters */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-full shadow-inner border border-slate-200/50 dark:border-slate-700/50">
              <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} color="from-slate-400 to-slate-500" />
              <FilterBtn label="Critical" active={filter === 'critical'} onClick={() => setFilter('critical')} color="from-red-500 to-rose-600" />
              <FilterBtn label="High" active={filter === 'high'} onClick={() => setFilter('high')} color="from-orange-500 to-amber-600" />
              <FilterBtn label="Medium" active={filter === 'medium'} onClick={() => setFilter('medium')} color="from-amber-400 to-yellow-500" />
              <FilterBtn label="Low" active={filter === 'low'} onClick={() => setFilter('low')} color="from-emerald-400 to-green-500" />
            </div>
          </div>
        </div>

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
                className={`p-6 rounded-2xl border ${getRiskBg(data.risk)} flex flex-col justify-between h-full`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">{state}</h3>
                    <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm">
                      {getRiskIcon(data.risk)}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Key Issues</p>
                    <div className="flex flex-wrap gap-2">
                      {data.issues.map(issue => (
                        <span key={issue} className="px-3 py-1 bg-white/60 dark:bg-black/30 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => onGetAdvice(state)}
                  className="w-full py-3 mt-auto bg-gov-card dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-gov-navy dark:text-blue-400 font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 shadow-subtle hover:shadow-subtle-hover"
                >
                  <MessageSquare size={18} /> Get Advice
                </button>
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
