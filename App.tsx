import React, { useState, useEffect } from 'react';
import { FeedbackModal } from './components/FeedbackModal';
import { Tour } from './components/Tour';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AnalysisModule } from './components/AnalysisModule';
import { WaterIntel } from './components/WaterIntel';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminMap } from './components/AdminMap';
import { UserManagement } from './components/admin/UserManagement';
import { WaterMap } from './components/WaterMap';
import { WaterFAQ } from './components/WaterFAQ';
import { WaterTools } from './components/WaterTools';
import { FeedbackPage } from './components/FeedbackPage';
import { Footer } from './components/Footer';
import { StarterGuide } from './components/StarterGuide';
import { QuickActions } from './components/QuickActions';
import { Activity, Camera, Map as MapIcon, Home, Mic, LayoutDashboard, Calculator, HelpCircle, MapPin, X, ChevronRight } from 'lucide-react';
import { TRANSLATIONS } from './constants';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './src/AuthContext';

function AppContent() {
  const { user, login, demoLogin, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [darkMode, setDarkMode] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [userState, setUserState] = useState('');
  const [userSource, setUserSource] = useState('');
  const [isStarterGuideOpen, setIsStarterGuideOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('jaldrishti_onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    
    // Open starter guide on mount as requested
    setIsStarterGuideOpen(true);
    
    const handleOpenGuide = () => setIsStarterGuideOpen(true);
    document.addEventListener('open-starter-guide', handleOpenGuide);
    return () => {
      document.removeEventListener('open-starter-guide', handleOpenGuide);
    };
  }, []);

  const handleFinishOnboarding = () => {
    localStorage.setItem('jaldrishti_onboarding', 'true');
    setShowOnboarding(false);
    if (userState && userSource) {
      // Setup complete
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home': 
        return <Dashboard language={language} setActiveTab={setActiveTab} />;
      case 'analyze': return <AnalysisModule language={language} />;
      case 'intel': return <WaterIntel language={language} />;
      case 'tools': return <WaterTools language={language} />;
      case 'map': return <WaterMap language={language} />;
      case 'faq': return <WaterFAQ language={language} />;
      case 'feedback': return <FeedbackPage language={language} />;
      case 'admin': 
        return isAdmin ? <AdminDashboard language={language} /> : <Dashboard language={language} setActiveTab={setActiveTab} />;
      default: 
        return <Dashboard language={language} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`min-h-screen flex flex-col font-sans selection:bg-blue-500/20 ${darkMode ? 'bg-gov-dark-navy text-white' : 'bg-gov-bg text-slate-900'}`}
    >
      <Toaster position="bottom-right" />
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        language={language} 
        setLanguage={setLanguage}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        user={user}
        isAdmin={isAdmin}
        onLogin={login}
        onDemoLogin={demoLogin}
        onLogout={logout}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />
      
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} language={language} />
      <Tour language={language} />
      
      {/* Main Container */}
      <main className="flex-grow pt-24 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 w-full max-w-screen-2xl mx-auto transition-all duration-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Starter Guide Modal */}
      <StarterGuide isOpen={isStarterGuideOpen} onClose={() => setIsStarterGuideOpen(false)} language={language} />
      <QuickActions onAction={(tab) => setActiveTab(tab)} language={language} />

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
              className="bg-gov-card dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(step => (
                      <div key={step} className={`h-2 w-8 rounded-full ${step <= onboardingStep ? 'bg-gov-navy' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  <button onClick={() => { localStorage.setItem('jaldrishti_onboarding', 'true'); setShowOnboarding(false); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium">{language === 'en' ? 'Skip' : 'छोड़ें'}</button>
                </div>

                {onboardingStep === 1 && (
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6">🌐</div>
                    <h2 className="text-2xl font-bold text-gov-navy dark:text-white font-display">{language === 'en' ? 'Select Language' : 'भाषा चुनें'}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{language === 'en' ? 'Please select your preferred language.' : 'कृपया अपनी पसंदीदा भाषा चुनें।'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setLanguage('en')}
                        className={`p-3 rounded-xl border font-medium transition-all ${language === 'en' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300' : 'bg-gov-card border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                      >
                        English
                      </button>
                      <button 
                        onClick={() => setLanguage('hi')}
                        className={`p-3 rounded-xl border font-medium transition-all ${language === 'hi' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300' : 'bg-gov-card border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                      >
                        हिन्दी
                      </button>
                    </div>
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6">👋</div>
                    <h2 className="text-2xl font-bold text-gov-navy dark:text-white font-display">{language === 'en' ? 'Welcome to JalDrishti' : 'जल दृष्टि में आपका स्वागत है'}</h2>
                    <p className="text-slate-600 dark:text-slate-400">{language === 'en' ? 'Your personal water quality assistant. We help you analyze, understand, and improve the water you drink every day.' : 'आपका व्यक्तिगत जल गुणवत्ता सहायक। हम आपको हर दिन पीने वाले पानी का विश्लेषण करने, समझने और सुधारने में मदद करते हैं।'}</p>
                  </div>
                )}

                {onboardingStep === 3 && (
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6">💧</div>
                    <h2 className="text-2xl font-bold text-gov-navy dark:text-white font-display">{language === 'en' ? 'Tell us about your water' : 'हमें अपने पानी के बारे में बताएं'}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{language === 'en' ? 'What is your primary source of drinking water?' : 'आपके पीने के पानी का प्राथमिक स्रोत क्या है?'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Borewell', 'Municipal', 'Tanker', 'Other'].map(src => (
                        <button 
                          key={src}
                          onClick={() => setUserSource(src)}
                          className={`p-3 rounded-xl border font-medium transition-all ${userSource === src ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300' : 'bg-gov-card border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                        >
                          {language === 'hi' ? (src === 'Borewell' ? 'बोरवेल' : src === 'Municipal' ? 'नगरपालिका' : src === 'Tanker' ? 'टैंकर' : 'अन्य') : src}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {onboardingStep === 4 && (
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6">📍</div>
                    <h2 className="text-2xl font-bold text-gov-navy dark:text-white font-display">{language === 'en' ? 'Where are you?' : 'आप कहां हैं?'}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{language === 'en' ? 'Water quality varies greatly by region. Select your state to get personalized alerts.' : 'पानी की गुणवत्ता क्षेत्र के अनुसार बहुत भिन्न होती है। व्यक्तिगत अलर्ट प्राप्त करने के लिए अपने राज्य का चयन करें।'}</p>
                    <select 
                      value={userState}
                      onChange={(e) => setUserState(e.target.value)}
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">{language === 'en' ? 'Select your state...' : 'अपना राज्य चुनें...'}</option>
                      <option value="Bihar">{language === 'en' ? 'Bihar' : 'बिहार'}</option>
                      <option value="West Bengal">{language === 'en' ? 'West Bengal' : 'पश्चिम बंगाल'}</option>
                      <option value="Rajasthan">{language === 'en' ? 'Rajasthan' : 'राजस्थान'}</option>
                      <option value="Maharashtra">{language === 'en' ? 'Maharashtra' : 'महाराष्ट्र'}</option>
                      <option value="Karnataka">{language === 'en' ? 'Karnataka' : 'कर्नाटक'}</option>
                      <option value="Delhi">{language === 'en' ? 'Delhi' : 'दिल्ली'}</option>
                      <option value="Other">{language === 'en' ? 'Other' : 'अन्य'}</option>
                    </select>
                  </div>
                )}

                <div className="mt-8">
                  <button 
                    onClick={() => {
                      if (onboardingStep < 4) setOnboardingStep(onboardingStep + 1);
                      else handleFinishOnboarding();
                    }}
                    className="w-full py-4 bg-gov-navy hover:bg-gov-navy/90 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {onboardingStep < 4 ? (language === 'en' ? 'Continue' : 'जारी रखें') : (language === 'en' ? 'Get Started' : 'शुरू करें')} <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation - Hackathon Level */}
      <div className={`fixed bottom-0 left-0 right-0 h-[72px] md:hidden z-50 px-4 flex justify-between items-center backdrop-blur-xl border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-colors duration-300 ${darkMode ? 'bg-gov-dark-navy/90 border-white/10' : 'bg-white/90 border-slate-200/50'}`}>
        <NavBtn id="mobile-nav-home" icon={Home} label={t.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} darkMode={darkMode} />
        <NavBtn id="mobile-nav-analyze" icon={Camera} label={t.analyze} active={activeTab === 'analyze'} onClick={() => setActiveTab('analyze')} darkMode={darkMode} />
        <NavBtn id="mobile-nav-tools" icon={Calculator} label={language === 'en' ? 'Tools' : 'उपकरण'} active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} darkMode={darkMode} />
        {isAdmin && <NavBtn id="mobile-nav-admin" icon={LayoutDashboard} label={t.admin} active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} darkMode={darkMode} />}
        <NavBtn id="mobile-nav-intel" icon={MapIcon} label={t.intel} active={activeTab === 'intel'} onClick={() => setActiveTab('intel')} darkMode={darkMode} />
      </div>

      <Footer onOpenFeedback={() => setIsFeedbackOpen(true)} language={language} />
    </motion.div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const NavBtn = ({ icon: Icon, label, active, onClick, darkMode, id }: any) => (
  <button 
    id={id}
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-[1.5rem] transition-all duration-300 relative group ${active ? 'text-white' : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}`}
  >
    {active && (
      <motion.div 
        layoutId="mobileNavIndicator"
        className="absolute inset-0 rounded-[1.5rem] -z-10 bg-gradient-to-tr from-blue-600 to-gov-teal shadow-[0_0_15px_rgba(34,184,166,0.5)]"
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
    )}
    <Icon size={22} strokeWidth={active ? 2.5 : 2} className={active ? 'animate-pulse' : 'group-hover:-translate-y-1 transition-transform duration-300'} />
    <span className="text-[10px] font-bold tracking-wider font-display">{label}</span>
  </button>
);