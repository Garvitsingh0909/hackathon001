import React from 'react';
import { Droplets, Globe, Bell, LayoutGrid, Activity, Map, FileText } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { motion } from 'motion/react';

interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    language: 'en' | 'hi';
    setLanguage: (lang: 'en' | 'hi') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, language, setLanguage }) => {
  const t = TRANSLATIONS[language].nav;

  const navItems = [
      { id: 'home', label: t.home, icon: LayoutGrid },
      { id: 'analyze', label: t.analyze, icon: Activity },
      { id: 'intel', label: t.intel, icon: FileText },
      { id: 'admin', label: t.admin, icon: Map },
  ];

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-slate-200/50 rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300"
      >
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
          <div className="bg-gradient-to-br from-[#0B1F3B] to-[#1e3a8a] p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <Droplets className="text-[#1CA7A6] h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight font-display">JalDrishti<span className="text-[#1CA7A6]">.AI</span></h1>
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1">Governance Portal</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50 relative">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 relative z-10 ${
                        activeTab === item.id 
                        ? 'text-[#0B1F3B] font-semibold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {activeTab === item.id && (
                        <motion.div
                            layoutId="navbar-indicator"
                            className="absolute inset-0 bg-white shadow-sm rounded-lg border border-black/5 -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100/80 rounded-lg p-1 border border-slate-200/50">
                <button 
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all uppercase tracking-wide relative ${language === 'en' ? 'text-[#0B1F3B] shadow-sm bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLanguage('hi')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all uppercase tracking-wide relative ${language === 'hi' ? 'text-[#0B1F3B] shadow-sm bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    HI
                </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

            {/* Notification */}
            <button className="relative p-2.5 text-slate-400 hover:text-[#0B1F3B] hover:bg-slate-100 rounded-xl transition-all group">
                <Bell size={20} strokeWidth={2} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
            </button>

            {/* Profile */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B1F3B] to-[#334155] text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-900/20 cursor-pointer hover:scale-105 hover:shadow-lg transition-all border-2 border-white">
                JD
            </div>
        </div>
      </motion.div>
    </nav>
  );
};