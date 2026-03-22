import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X, Play, Droplets, Info, ArrowRight } from 'lucide-react';
import { playBrowserTTS } from '../lib/gemini';

interface StarterGuideProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'en' | 'hi';
}

const GUIDE_TEXT = {
    en: "Welcome to JalDrishti. Here are the basics: 1. Use the Analyze tab to take a photo of your water and get an instant quality check. 2. Check the Map to see water quality in your area. 3. Use the Tools tab to calculate your daily water needs and filter costs. Always boil water if you are unsure about its safety.",
    hi: "जल दृष्टि में आपका स्वागत है। यहाँ कुछ बुनियादी बातें हैं: 1. अपने पानी की फोटो खींचकर तुरंत गुणवत्ता जांचने के लिए एनालाइज टैब का उपयोग करें। 2. अपने क्षेत्र में पानी की गुणवत्ता देखने के लिए मैप देखें। 3. अपनी दैनिक पानी की जरूरतों और फिल्टर की लागत की गणना करने के लिए टूल्स टैब का उपयोग करें। यदि आप पानी की सुरक्षा के बारे में अनिश्चित हैं, तो हमेशा पानी उबालें।"
};

export const StarterGuide: React.FC<StarterGuideProps> = ({ isOpen, onClose, language }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isOpen]);

    const playGuide = (lang: 'en' | 'hi') => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const text = GUIDE_TEXT[lang];
        playBrowserTTS(
            text,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false),
            lang === 'hi' ? 'hi-IN' : 'en-IN'
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Header Image/Pattern */}
                        <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,white,transparent_70%)] animate-pulse"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/20">
                                    <Droplets size={32} className="animate-bounce" />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 text-center">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight mb-2">
                                {language === 'en' ? 'Welcome to JalDrishti' : 'जलदृष्टि में आपका स्वागत है'}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                                {language === 'en' 
                                    ? 'Your AI-powered companion for monitoring and protecting our precious water resources in the Tamsa River basin.' 
                                    : 'तमसा नदी बेसिन में हमारे बहुमूल्य जल संसाधनों की निगरानी और सुरक्षा के लिए आपका एआई-संचालित साथी।'}
                            </p>

                            <div className="grid grid-cols-1 gap-3 mb-8">
                                <button
                                    onClick={() => playGuide('en')}
                                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group border ${
                                        isSpeaking 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                        : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-slate-100 dark:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <Volume2 size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">English Audio Guide</p>
                                            <p className="text-[10px] text-slate-500">Listen to the introduction in English</p>
                                        </div>
                                    </div>
                                    <Play size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </button>

                                <button
                                    onClick={() => playGuide('hi')}
                                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group border ${
                                        isSpeaking 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                                        : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-slate-100 dark:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <Volume2 size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">हिंदी ऑडियो गाइड</p>
                                            <p className="text-[10px] text-slate-500">हिंदी में परिचय सुनें</p>
                                        </div>
                                    </div>
                                    <Play size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                {language === 'en' ? 'Get Started' : 'शुरू करें'} <ArrowRight size={18} />
                            </button>
                        </div>

                        {isSpeaking && (
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                className="bg-blue-600 p-3 flex items-center justify-center gap-3"
                            >
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-1 h-3 bg-white/60 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Voice Guide Active</span>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
