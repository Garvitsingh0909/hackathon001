import React from 'react';
import { Droplets, Globe, Bell, LayoutGrid, Activity, Map, FileText } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

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
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 h-16 transition-all duration-300 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-[#0B1F3B] p-2 rounded-lg shadow-sm">
            <Droplets className="text-[#1CA7A6] h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">JalDrishti AI</h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Governance Portal</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        activeTab === item.id 
                        ? 'bg-white text-[#0B1F3B] shadow-sm text-blue-900' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    {/* Icon optional on desktop text menu, keeping it clean with just text usually, but adding for 'interface' request */}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-[#0B1F3B] shadow-sm' : 'text-slate-400'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLanguage('hi')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'hi' ? 'bg-white text-[#0B1F3B] shadow-sm' : 'text-slate-400'}`}
                >
                    हिंदी
                </button>
            </div>

            {/* Notification */}
            <button className="relative p-2 text-slate-500 hover:text-[#0B1F3B] transition-colors rounded-full hover:bg-slate-50">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile */}
            <div className="w-9 h-9 rounded-full bg-[#0B1F3B] text-white flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform">
                JD
            </div>
        </div>
      </div>
    </nav>
  );
};