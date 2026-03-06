import React from 'react';
import { Bell, LayoutGrid, Activity, Map, FileText, Moon, Sun, Droplets } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { motion } from 'motion/react';

interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    language: 'en' | 'hi';
    setLanguage: (lang: 'en' | 'hi') => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, language, setLanguage, darkMode, toggleDarkMode }) => {
  const t = TRANSLATIONS[language].nav;

  const navItems = [
      { id: 'home', label: t.home, icon: LayoutGrid },
      { id: 'analyze', label: t.analyze, icon: Activity },
      { id: 'intel', label: t.intel, icon: FileText },
      { id: 'admin', label: t.admin, icon: Map },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
                <div className="relative h-10 w-10 flex items-center justify-center">
                    <img 
                        src="/logo.svg" 
                        alt="JalDrishti AI" 
                        className="h-full w-full object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }} 
                    />
                    <div className="hidden bg-[#0B1F3B] p-1.5 rounded-lg absolute inset-0 flex items-center justify-center">
                        <Droplets className="text-white h-6 w-6" strokeWidth={2.5} />
                    </div>
                </div>
                <span className={`text-lg font-bold font-display tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    JalDrishti<span className="text-[#1CA7A6]">.AI</span>
                </span>
            </div>

            {/* Desktop Navigation - Minimal Pill */}
            <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        id={`nav-${item.id}`}
                        className={`tour-${item.id} px-4 py-1.5 rounded-full text-sm font-medium transition-colors relative ${
                            activeTab === item.id 
                            ? (darkMode ? 'text-white' : 'text-slate-900')
                            : (darkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                        }`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="navbar-pill"
                                className={`absolute inset-0 rounded-full -z-10 ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-full transition-colors ${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className={`flex items-center gap-1 text-xs font-medium rounded-full p-1 border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1 rounded-full transition-all ${language === 'en' ? (darkMode ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') : 'hover:opacity-80'}`}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => setLanguage('hi')}
                        className={`px-3 py-1 rounded-full transition-all ${language === 'hi' ? (darkMode ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') : 'hover:opacity-80'}`}
                    >
                        HI
                    </button>
                </div>
                
                <button className={`transition-colors relative ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                    JD
                </div>
            </div>
        </div>
      </div>
    </nav>
  );
};