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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        language={language} 
        setLanguage={setLanguage} 
      />
      
      {/* Main Container - Centered and Max Width restricted for big screens */}
      <main className="flex-grow pt-20 pb-24 md:pb-12 px-0 md:px-4 w-full max-w-6xl mx-auto transition-all duration-300">
        {renderContent()}
      </main>

      {/* Floating Assistant Button */}
      <button 
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-[#0B1F3B] text-white rounded-full shadow-xl shadow-blue-900/30 flex items-center justify-center hover:scale-105 transition-transform z-40 btn-press animate-pulse-ring"
        aria-label="Open Voice Assistant"
      >
        <Mic size={28} />
      </button>

      {/* Voice Assistant Modal */}
      <Assistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />

      {/* Mobile Bottom Navigation - Glassmorphism */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 md:hidden z-40 px-6 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${active ? 'text-[#0B1F3B] bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);