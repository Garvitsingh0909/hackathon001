import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X, Play, Square, Loader2 } from 'lucide-react';
import { playBrowserTTS } from '../lib/claude';

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
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        if (!isOpen) {
            stopAudio();
        }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    const stopAudio = () => {
        if (sourceRef.current) {
            try {
                sourceRef.current.stop();
            } catch (e) {}
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsLoading(false);
    };

    const playGuide = async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        setIsLoading(true);
        try {
            const textToSpeak = GUIDE_TEXT[language];
            playBrowserTTS(
                textToSpeak,
                () => { setIsLoading(false); setIsPlaying(true); },
                () => setIsPlaying(false),
                language === 'hi' ? 'hi-IN' : 'en-IN'
            );
        } catch (e) {
            console.error("TTS Error:", e);
            setIsLoading(false);
            setIsPlaying(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                        className="bg-gov-card dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 relative"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 rounded-full"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="p-6 md:p-8 text-center">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Volume2 size={40} className="text-blue-500" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gov-navy dark:text-white font-display mb-2">
                                {language === 'en' ? 'Welcome to JalDrishti' : 'जल दृष्टि में आपका स्वागत है'}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                                {language === 'en' 
                                    ? 'Your companion for clean water governance and personal safety.' 
                                    : 'स्वच्छ जल शासन और व्यक्तिगत सुरक्षा के लिए आपका साथी।'}
                            </p>

                            <div className="grid grid-cols-1 gap-3 mb-8 text-left">
                                <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white mb-0.5">{language === 'en' ? 'Analyze Water' : 'पानी का विश्लेषण करें'}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{language === 'en' ? 'Take a photo to check quality instantly.' : 'गुणवत्ता जांचने के लिए फोटो लें।'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white mb-0.5">{language === 'en' ? 'Explore Map' : 'मैप देखें'}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{language === 'en' ? 'See water quality trends in your region.' : 'अपने क्षेत्र में पानी की गुणवत्ता देखें।'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100/50 dark:border-amber-800/30">
                                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white mb-0.5">{language === 'en' ? 'Use Tools' : 'टूल्स का उपयोग करें'}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{language === 'en' ? 'Calculate needs and filter costs easily.' : 'जरूरतों और फिल्टर लागत की गणना करें।'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={playGuide}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                    isPlaying 
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50' 
                                        : 'bg-gov-navy hover:bg-gov-navy/90 text-white shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {isLoading ? (
                                    <><Loader2 size={20} className="animate-spin" /> {language === 'en' ? 'Loading...' : 'लोड हो रहा है...'}</>
                                ) : isPlaying ? (
                                    <><Square size={20} className="fill-current" /> {language === 'en' ? 'Stop Audio Guide' : 'ऑडियो गाइड रोकें'}</>
                                ) : (
                                    <><Volume2 size={20} /> {language === 'en' ? 'Listen to Audio Guide' : 'ऑडियो गाइड सुनें'}</>
                                )}
                            </button>
                            
                            <button 
                                onClick={onClose}
                                className="mt-4 w-full py-3 text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-800 dark:hover:text-white transition-colors"
                            >
                                {language === 'en' ? 'Dismiss' : 'हटाएं'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
