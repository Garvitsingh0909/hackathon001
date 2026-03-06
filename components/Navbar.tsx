import React, { useState, useEffect } from 'react';
import { Bell, LayoutGrid, Activity, Map, FileText, Moon, Sun, Droplets, Clock, Lightbulb, Calculator, HelpCircle, MapPin, Share2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    language: 'en' | 'hi';
    setLanguage: (lang: 'en' | 'hi') => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const TIPS = [
    "Boil water for 1 min to kill 99.9% bacteria 🦠",
    "TDS meter costs only ₹300 — every home should have one 💧",
    "Clean your water tank every 6 months 🚰",
    "RO water with TDS below 50 lacks essential minerals ⚠️",
    "Harvest rainwater to recharge groundwater levels 🌧️"
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, language, setLanguage, darkMode, toggleDarkMode }) => {
  const t = TRANSLATIONS[language].nav;
  const [time, setTime] = useState(new Date());
  const [currentTip, setCurrentTip] = useState(0);
  const [isRipple, setIsRipple] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "JalDrishti AI",
          text: "Check your water quality for free with India's smartest water assistant!",
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const tipTimer = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % TIPS.length);
    }, 8000);
    return () => {
        clearInterval(timer);
        clearInterval(tipTimer);
    };
  }, []);

  const handleLogoClick = () => {
      setIsRipple(true);
      setActiveTab('home');
      setTimeout(() => setIsRipple(false), 600);
  };

  const navItems = [
      { id: 'home', label: t.home, icon: LayoutGrid },
      { id: 'analyze', label: t.analyze, icon: Activity },
      { id: 'intel', label: t.intel, icon: FileText },
      { id: 'map', label: t.map, icon: MapPin },
      { id: 'tools', label: t.tools, icon: Calculator },
      { id: 'faq', label: t.faq, icon: HelpCircle },
      { id: 'admin', label: t.admin, icon: Map },
  ];

  const istTime = time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
        <nav className={`backdrop-blur-md border-b transition-colors duration-300 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                {/* Brand */}
                <div className="flex items-center gap-3 cursor-pointer relative" onClick={handleLogoClick}>
                    <div className={`absolute inset-0 rounded-full ${isRipple ? 'ripple' : ''}`}></div>
                    <div className="relative h-10 w-10 flex items-center justify-center z-10">
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
                    <span className={`text-lg font-bold font-display tracking-tight z-10 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
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
                    {/* AI Enhanced Badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">AI Enhanced</span>
                    </div>

                    {/* Live Clock */}
                    <div className={`hidden lg:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <Clock size={14} className="text-[#1CA7A6]" />
                        <span>{istTime} IST</span>
                    </div>

                    {/* Share Button */}
                    <button 
                        onClick={handleShare}
                        className={`p-2 rounded-full transition-colors ${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                        aria-label="Share JalDrishti AI"
                    >
                        <Share2 size={20} />
                    </button>

                    <button 
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-colors ${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                        aria-label="Toggle Dark Mode"
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
        
        {/* Tip of the Day Banner */}
        <div className={`w-full py-1.5 px-4 text-xs font-medium flex items-center justify-center gap-2 border-b ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-blue-50/80 border-blue-100 text-blue-800'} backdrop-blur-md`}>
            <Lightbulb size={14} className="text-amber-500 shrink-0" />
            <span className="font-bold shrink-0">Tip of the Day:</span>
            <div className="overflow-hidden relative h-4 w-full max-w-md">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentTip}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 truncate"
                    >
                        {TIPS[currentTip]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
};