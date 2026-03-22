import React, { useState, useEffect } from 'react';
import { Bell, LayoutGrid, Activity, Map, FileText, Moon, Sun, Droplets, Clock, Lightbulb, Calculator, HelpCircle, MapPin, Share2, MessageSquare, Award } from 'lucide-react';
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
    onOpenFeedback: () => void;
}

const TIPS = {
    en: [
        "Boil water for 1 min to kill 99.9% bacteria 🦠",
        "TDS meter costs only ₹300 — every home should have one 💧",
        "Clean your water tank every 6 months 🚰",
        "RO water with TDS below 50 lacks essential minerals ⚠️",
        "Harvest rainwater to recharge groundwater levels 🌧️"
    ],
    hi: [
        "99.9% बैक्टीरिया को मारने के लिए पानी को 1 मिनट तक उबालें 🦠",
        "टीडीएस मीटर की कीमत केवल ₹300 है — हर घर में एक होना चाहिए 💧",
        "हर 6 महीने में अपने पानी के टैंक को साफ करें 🚰",
        "50 से नीचे टीडीएस वाले आरओ पानी में आवश्यक खनिजों की कमी होती है ⚠️",
        "भूजल स्तर को रिचार्ज करने के लिए वर्षा जल का संचयन करें 🌧️"
    ]
};

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, language, setLanguage, darkMode, toggleDarkMode, user, isAdmin, onLogin, onLogout, onOpenFeedback }) => {
  const t = TRANSLATIONS[language].nav;
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
      { id: 'home', label: t.home, icon: LayoutGrid },
      { id: 'analyze', label: t.analyze, icon: Activity },
      { id: 'tools', label: language === 'en' ? 'Tools' : 'उपकरण', icon: Calculator },
      { id: 'intel', label: t.intel, icon: FileText },
      { id: 'map', label: t.map, icon: MapPin },
      { id: 'faq', label: t.faq, icon: HelpCircle },
      { id: 'feedback', label: t.feedback, icon: MessageSquare },
      ...(isAdmin ? [{ id: 'admin', label: t.admin, icon: Map }] : []),
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
        <nav className={`backdrop-blur-xl border-b transition-all duration-300 ${darkMode ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200/50'}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
                {/* Brand */}
                <div 
                  className="flex items-center gap-2 cursor-pointer group" 
                  onClick={() => setActiveTab('home')}
                >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                      <Droplets size={16} />
                    </div>
                    <span className={`text-lg font-extrabold font-display tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Jal<span className="text-blue-500">Drishti</span>
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-x-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/5">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all relative ${
                                activeTab === item.id 
                                ? 'text-blue-600 dark:text-blue-400'
                                : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                            }`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {activeTab === item.id && (
                              <motion.div 
                                layoutId="navActive"
                                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm -z-10"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <span className="font-display uppercase tracking-wider">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <button 
                        onClick={toggleDarkMode}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${darkMode ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    {/* Language Toggle */}
                    <div className={`flex items-center p-0.5 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
                        >
                            EN
                        </button>
                        <button 
                            onClick={() => setLanguage('hi')}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all ${language === 'hi' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
                        >
                            HI
                        </button>
                    </div>
                    
                    {/* Profile */}
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
                        {user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="h-8 w-8 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all"
                                >
                                    {user.photoURL ? (
                                        <img 
                                            src={user.photoURL} 
                                            alt={user.displayName} 
                                            className="w-full h-full object-cover" 
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                            {user.displayName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </button>
                                
                                <AnimatePresence>
                                  {showProfileMenu && (
                                      <motion.div 
                                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                          className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-200 dark:border-white/5 p-2 z-50"
                                      >
                                          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 mb-2">
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.signedInAs}</p>
                                              <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{user.displayName}</p>
                                          </div>
                                          <button 
                                              onClick={() => { onOpenFeedback(); setShowProfileMenu(false); }}
                                              className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors mb-1"
                                          >
                                              {t.sendFeedback}
                                          </button>
                                          <button 
                                              onClick={() => { onLogout?.(); setShowProfileMenu(false); }}
                                              className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                          >
                                              {t.signOut}
                                          </button>
                                      </motion.div>
                                  )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button 
                                onClick={onLogin}
                                className="h-10 px-5 bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10 dark:shadow-blue-600/20"
                            >
                                {t.signIn}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </nav>
    </div>
  );
};
