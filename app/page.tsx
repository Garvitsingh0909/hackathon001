"use client";
import React, { useState, useEffect } from 'react';
import { Tour } from '../components/Tour';
import { Navbar } from '../components/Navbar';
import { Dashboard } from '../components/Dashboard';
import { AnalysisModule } from '../components/AnalysisModule';
import { WaterIntel } from '../components/WaterIntel';
import { AdminMap } from '../components/AdminMap';
import { WaterMap } from '../components/WaterMap';
import { WaterTools } from '../components/WaterTools';
import { WaterFAQ } from '../components/WaterFAQ';
import { Assistant } from '../components/Assistant';
import { Footer } from '../components/Footer';
import { StarterGuide } from '../components/StarterGuide';
import { Activity, Camera, Map as MapIcon, Home, Mic, LayoutDashboard, Calculator, HelpCircle, MapPin, X, ChevronRight } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [userState, setUserState] = useState('');
  const [userSource, setUserSource] = useState('');
  const [assistantInitialMsg, setAssistantInitialMsg] = useState('');
  const [isStarterGuideOpen, setIsStarterGuideOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('jaldrishti_onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    
    const handleOpenGuide = () => setIsStarterGuideOpen(true);
    document.addEventListener('open-starter-guide', handleOpenGuide);
    return () => document.removeEventListener('open-starter-guide', handleOpenGuide);
  }, []);

  const handleFinishOnboarding = () => {
    localStorage.setItem('jaldrishti_onboarding', 'true');
    setShowOnboarding(false);
    if (userState && userSource) {
      setAssistantInitialMsg(`I am in ${userState} using ${userSource} water. What are the top risks I should know about?`);
      setIsAssistantOpen(true);
    }
  };

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const t = TRANSLATIONS[language].nav;

  const handleAskAI = (question: string) => {
    setAssistantInitialMsg(question);
    setIsAssistantOpen(true);
  };

  const getSeasonalAlert = () => {
    const month = new Date().getMonth(); // 0-11
    if (month >= 5 && month <= 8) {
      return { type: 'monsoon', text: "⚠️ Monsoon Alert: Boil water before drinking. Turbidity and bacteria risk is HIGH." };
    } else if (month >= 2 && month <= 4) {
      return { type: 'summer', text: "☀️ Summer Alert: TDS rises as water evaporates. Re-test your water." };
    } else if (month >= 9 && month <= 10) {
      return { type: 'post-monsoon', text: "🍂 Post-monsoon: Check for leftover contamination from floods." };
    }
    return null;
  };

  const seasonalAlert = getSeasonalAlert();

  const renderContent = () => {
    switch (activeTab) {
      case 'home': 
        return <Dashboard onChangeTab={setActiveTab} onOpenAssistant={() => setIsAssistantOpen(true)} language={language} />;
      case 'analyze': return <AnalysisModule />;
      case 'intel': return <WaterIntel />;
      case 'map': return <WaterMap onGetAdvice={handleAskAI} />;
      case 'tools': return <WaterTools language={language} />;
      case 'faq': return <WaterFAQ onAskAI={handleAskAI} />;
      case 'admin': return <AdminMap />;
      default: 
        return <Dashboard onChangeTab={setActiveTab} onOpenAssistant={() => setIsAssistantOpen(true)} language={language} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-gov-teal/20 selection:text-gov-navy ${darkMode ? 'bg-gov-navy text-white' : 'bg-gov-bg text-slate-900'}`}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        language={language} 
        setLanguage={setLanguage}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />
      <Tour />
      
      {/* Seasonal Alert Banner */}
      {seasonalAlert && (
        <div className={`w-full py-2 px-4 text-sm font-bold flex items-center justify-center gap-2 mt-16 z-30 relative ${
            seasonalAlert.type === 'monsoon' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400' :
            seasonalAlert.type === 'summer' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
        }`}>
          {seasonalAlert.text}
        </div>
      )}

      {/* Main Container - Centered and Max Width restricted for big screens */}
      <main className={`flex-grow ${seasonalAlert ? 'pt-8' : 'pt-28'} pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto transition-all duration-300`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Assistant Button */}
      <motion.button 
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAssistantOpen(true)}
        className={`fixed bottom-[28px] md:bottom-10 right-1/2 translate-x-1/2 md:translate-x-0 md:right-10 w-[72px] h-[72px] rounded-full shadow-subtle-hover flex flex-col items-center justify-center z-[60] btn-press group border-2 transition-colors duration-300 ${
          isAssistantOpen ? 'bg-gov-teal border-gov-teal shadow-[0_0_20px_rgba(0,188,212,0.5)]' : 'bg-gov-navy border-gov-navy'
        }`}
        aria-label="Open Voice Assistant"
      >
        {isAssistantOpen && (
          <div className="absolute inset-0 rounded-full border-2 border-gov-teal/50 scale-110 opacity-0 animate-pulse-ring"></div>
        )}
        <Mic size={32} className="text-white transition-colors" />
        {!isAssistantOpen && (
          <span className="absolute -bottom-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap opacity-100 transition-opacity duration-300">Tap to speak</span>
        )}
      </motion.button>

      {/* Voice Assistant Modal */}
      <Assistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} initialMessage={assistantInitialMsg} onNavigate={setActiveTab} />

      {/* Starter Guide Modal */}
      <StarterGuide isOpen={isStarterGuideOpen} onClose={() => setIsStarterGuideOpen(false)} language={language} />

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gov-card dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-2">
                    {[1, 2, 3].map(step => (
                      <div key={step} className={`h-2 w-8 rounded-full ${step <= onboardingStep ? 'bg-gov-navy' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  <button onClick={() => { localStorage.setItem('jaldrishti_onboarding', 'true'); setShowOnboarding(false); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium">Skip</button>
                </div>

                {onboardingStep === 1 && (
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6">👋</div>
                    <h2 className="text-2xl font-bold text-gov-navy dark:text-white font-display">Welcome to JalDrishti AI</h2>
                    <p className="text-slate-600 dark:text-slate-400">Your personal water quality assistant. We help you analyze, understand, and improve the water you drink every day.</p>
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6">💧</div>
                    <h2 className="text-2xl font-bold text-gov-navy dark:text-white font-display">Tell us about your water</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">What is your primary source of drinking water?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Borewell', 'Municipal', 'Tanker', 'Other'].map(src => (
                        <button 
                          key={src}
                          onClick={() => setUserSource(src)}
                          className={`p-3 rounded-xl border font-medium transition-all ${userSource === src ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300' : 'bg-gov-card border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {onboardingStep === 3 && (
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6">📍</div>
                    <h2 className="text-2xl font-bold text-gov-navy dark:text-white font-display">Where are you?</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Water quality varies greatly by region. Select your state to get personalized alerts.</p>
                    <select 
                      value={userState}
                      onChange={(e) => setUserState(e.target.value)}
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select your state...</option>
                      <option value="Bihar">Bihar</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

                <div className="mt-8">
                  <button 
                    onClick={() => {
                      if (onboardingStep < 3) setOnboardingStep(onboardingStep + 1);
                      else handleFinishOnboarding();
                    }}
                    className="w-full py-4 bg-gov-navy hover:bg-gov-navy/90 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {onboardingStep < 3 ? 'Continue' : 'Get Started'} <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation - Hackathon Level */}
      <div className={`fixed bottom-0 left-0 right-0 h-[72px] md:hidden z-50 px-6 flex justify-between items-center backdrop-blur-xl border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-colors duration-300 ${darkMode ? 'bg-gov-dark-navy/90 border-white/10' : 'bg-white/90 border-slate-200/50'}`}>
        <NavBtn id="mobile-nav-home" icon={Home} label={t.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} darkMode={darkMode} />
        <NavBtn id="mobile-nav-analyze" icon={Camera} label={t.analyze} active={activeTab === 'analyze'} onClick={() => setActiveTab('analyze')} darkMode={darkMode} />
        <div className="w-16"></div> {/* Spacer for mic button */}
        <NavBtn id="mobile-nav-admin" icon={LayoutDashboard} label={t.admin} active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} darkMode={darkMode} />
        <NavBtn id="mobile-nav-intel" icon={MapIcon} label={t.intel} active={activeTab === 'intel'} onClick={() => setActiveTab('intel')} darkMode={darkMode} />
      </div>

      <Footer />
    </div>
  );
}

const NavBtn = ({ icon: Icon, label, active, onClick, darkMode, id }: any) => (
  <button 
    id={id}
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-2xl transition-all duration-300 relative group ${active ? 'text-white' : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}`}
  >
    {active && (
      <motion.div 
        layoutId="mobileNavIndicator"
        className="absolute inset-0 rounded-2xl -z-10 bg-gradient-to-tr from-blue-600 to-gov-teal shadow-[0_0_15px_rgba(34,184,166,0.5)]"
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
    )}
    <Icon size={22} strokeWidth={active ? 2.5 : 2} className={active ? 'animate-pulse' : 'group-hover:-translate-y-1 transition-transform duration-300'} />
    <span className="text-[10px] font-bold tracking-wider font-display">{label}</span>
  </button>
);