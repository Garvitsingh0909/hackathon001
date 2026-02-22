import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AnalysisModule } from './components/AnalysisModule';
import { WaterIntel } from './components/WaterIntel';
import { AdminMap } from './components/AdminMap';
import { Assistant } from './components/Assistant';
import { Footer } from './components/Footer';
import { Activity, Camera, Map as MapIcon, Home, Mic, LayoutDashboard } from 'lucide-react';
import { TRANSLATIONS } from './constants';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const t = TRANSLATIONS[language].nav;

  const renderContent = () => {
    switch (activeTab) {
      case 'home': 
        return <Dashboard onChangeTab={setActiveTab} onOpenAssistant={() => setIsAssistantOpen(true)} language={language} />;
      case 'analyze': return <AnalysisModule />;
      case 'intel': return <WaterIntel />;
      case 'admin': return <AdminMap />;
      default: 
        return <Dashboard onChangeTab={setActiveTab} onOpenAssistant={() => setIsAssistantOpen(true)} language={language} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        language={language} 
        setLanguage={setLanguage} 
      />
      
      {/* Main Container - Centered and Max Width restricted for big screens */}
      <main className="flex-grow pt-28 pb-24 md:pb-12 px-4 w-full max-w-7xl mx-auto transition-all duration-300">
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
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-gradient-to-br from-[#0B1F3B] to-blue-900 text-white rounded-2xl shadow-2xl shadow-blue-900/40 flex items-center justify-center z-40 btn-press group border border-white/10"
        aria-label="Open Voice Assistant"
      >
        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Mic size={28} className="group-hover:animate-pulse" />
      </motion.button>

      {/* Voice Assistant Modal */}
      <Assistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />

      {/* Mobile Bottom Navigation - Glassmorphism */}
      <div className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/20 md:hidden z-40 px-6 py-3 flex justify-between items-center shadow-xl shadow-slate-200/50 rounded-2xl">
        <NavBtn icon={Home} label={t.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavBtn icon={Camera} label={t.analyze} active={activeTab === 'analyze'} onClick={() => setActiveTab('analyze')} />
        <NavBtn icon={LayoutDashboard} label={t.admin} active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
        <NavBtn icon={MapIcon} label={t.intel} active={activeTab === 'intel'} onClick={() => setActiveTab('intel')} />
      </div>

      <Footer />
    </div>
  );
}

const NavBtn = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${active ? 'text-[#0B1F3B]' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {active && (
      <motion.div 
        layoutId="mobileNavIndicator"
        className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);