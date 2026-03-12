import React, { useState, useEffect } from 'react';
import { Bell, LayoutGrid, Activity, Map, FileText, Moon, Sun, Droplets, Clock, Lightbulb, Calculator, HelpCircle, MapPin, Share2, MessageSquare } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    language: 'en' | 'hi';
    setLanguage: (lang: 'en' | 'hi') => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
    user?: any;
    isAdmin?: boolean;
    onLogin?: () => void;
    onLogout?: () => void;
}

const TIPS = [
    "Boil water for 1 min to kill 99.9% bacteria 🦠",
    "TDS meter costs only ₹300 — every home should have one 💧",
    "Clean your water tank every 6 months 🚰",
    "RO water with TDS below 50 lacks essential minerals ⚠️",
    "Harvest rainwater to recharge groundwater levels 🌧️"
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, language, setLanguage, darkMode, toggleDarkMode, user, isAdmin, onLogin, onLogout }) => {
  const t = TRANSLATIONS[language].nav;
  const [time, setTime] = useState(new Date());
  const [currentTip, setCurrentTip] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [isRipple, setIsRipple] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
      ...(isAdmin ? [{ id: 'admin', label: t.admin, icon: Map }] : []),
  ];

  const istTime = time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
        <nav className={`backdrop-blur-xl border-b transition-colors duration-300 ${darkMode ? 'bg-gov-navy/80 border-white/10' : 'bg-gov-card/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 w-full">
                {/* Brand */}
                <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
                    <span className={`text-xl font-bold font-display tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Jal<span className="text-blue-500">Drishti</span> <span className="text-emerald-500">AI</span>
                    </span>
                </div>

                {/* Desktop Navigation - Hackathon Level */}
                <div className="hidden md:flex flex-1 justify-center items-center p-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-inner gap-x-2 mx-4 max-w-3xl">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            id={`nav-${item.id}`}
                            className={`tour-${item.id} relative px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 flex-1 ${
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
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">AI Enhanced</span>
                    </div>

                    {/* Live Clock */}
                    <div className={`hidden xl:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border ${darkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <Clock size={14} className="text-gov-teal" />
                        <span>{istTime} IST</span>
                    </div>

                    {/* Tip Toggle */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowTip(!showTip)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${darkMode ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            aria-label="Toggle Tip"
                        >
                            <Lightbulb size={18} />
                        </button>
                        <AnimatePresence>
                            {showTip && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50"
                                >
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{TIPS[currentTip]}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                        {user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="h-10 w-10 rounded-full overflow-hidden border-2 border-gov-teal shadow-sm hover:scale-105 transition-transform"
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gov-teal text-white flex items-center justify-center font-bold">
                                            {user.displayName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </button>
                                
                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                                                <p className="text-sm font-bold truncate">{user.displayName}</p>
                                            </div>
                                            <button 
                                                onClick={() => { onLogout?.(); setShowProfileMenu(false); }}
                                                className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                            >
                                                Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button 
                                onClick={onLogin}
                                className="px-4 py-2 bg-gov-navy dark:bg-blue-600 text-white text-sm font-bold rounded-full hover:scale-105 transition-all shadow-md shadow-blue-500/20"
                            >
                                Sign In
                            </button>
                        )}
                        <button className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105 ${darkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'}`}>
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </nav>
    </div>
  );
};
