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
        <nav className={`backdrop-blur-xl border-b transition-colors duration-300 ${darkMode ? 'bg-gov-navy/80 border-white/10' : 'bg-gov-card/80 border-slate-200'}`}>
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
                        <div className="hidden bg-gov-navy p-1.5 rounded-lg absolute inset-0 flex items-center justify-center">
                            <Droplets className="text-white h-6 w-6" strokeWidth={2.5} />
                        </div>
                    </div>
                    <span className={`text-lg font-bold font-display tracking-tight z-10 ${darkMode ? 'text-white' : 'text-gov-navy'}`}>
                        JalDrishti<span className="text-gov-teal">.AI</span>
                    </span>
                </div>

                {/* Desktop Navigation - Hackathon Level */}
                <div className="hidden md:flex items-center p-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-inner">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            id={`nav-${item.id}`}
                            className={`tour-${item.id} relative px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${
                                activeTab === item.id 
                                ? 'text-white shadow-lg'
                                : (darkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-gov-navy hover:bg-slate-200/50')
                            }`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="navbar-pill-active"
                                    className="absolute inset-0 rounded-full -z-10 bg-gradient-to-r from-blue-600 to-gov-teal shadow-[0_0_15px_rgba(34,184,166,0.4)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )}
                            <item.icon size={16} className={activeTab === item.id ? 'animate-pulse' : ''} />
                            <span className="font-display">{item.label}</span>
                        </button>
                    ))}
                </div>

                    {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* AI Enhanced Badge */}
                    <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">AI Enhanced</span>
                    </div>

                    {/* Live Clock */}
                    <div className={`hidden xl:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border ${darkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <Clock size={14} className="text-gov-teal" />
                        <span>{istTime} IST</span>
                    </div>

                    {/* Share Button */}
                    <button 
                        onClick={handleShare}
                        className={`hidden sm:flex w-10 h-10 items-center justify-center rounded-full transition-all hover:scale-105 ${darkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'}`}
                        aria-label="Share JalDrishti AI"
                    >
                        <Share2 size={18} />
                    </button>

                    {/* Dark Mode Toggle */}
                    <button 
                        onClick={toggleDarkMode}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105 ${darkMode ? 'bg-white/5 text-amber-400 hover:bg-white/10 border border-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        aria-label="Toggle Dark Mode"
                    >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Language Toggle */}
                    <div className={`flex items-center p-1 rounded-full border transition-colors ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-gov-teal text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            EN
                        </button>
                        <button 
                            onClick={() => setLanguage('hi')}
                            className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'hi' ? 'bg-gov-teal text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            HI
                        </button>
                    </div>
                    
                    {/* Profile/Notifications */}
                    <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                        <button className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105 ${darkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'}`}>
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border shadow-sm ${darkMode ? 'bg-gradient-to-br from-blue-600 to-gov-teal text-white border-white/10' : 'bg-gradient-to-br from-blue-500 to-gov-teal text-white border-transparent'}`}>
                            JD
                        </div>
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