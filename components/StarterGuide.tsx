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
    en: "Welcome to JalDrishti AI. Here are the basics: 1. Use the Analyze tab to take a photo of your water and get an instant quality check. 2. Check the Map to see water quality in your area. 3. Use the Tools tab to calculate your daily water needs and filter costs. Always boil water if you are unsure about its safety.",
    hi: "जल दृष्टि एआई में आपका स्वागत है। यहाँ कुछ बुनियादी बातें हैं: 1. अपने पानी की फोटो खींचकर तुरंत गुणवत्ता जांचने के लिए एनालाइज टैब का उपयोग करें। 2. अपने क्षेत्र में पानी की गुणवत्ता देखने के लिए मैप देखें। 3. अपनी दैनिक पानी की जरूरतों और फिल्टर की लागत की गणना करने के लिए टूल्स टैब का उपयोग करें। यदि आप पानी की सुरक्षा के बारे में अनिश्चित हैं, तो हमेशा पानी उबालें।"
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
                                {language === 'en' ? 'Starter Guide' : 'शुरुआती गाइड'}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm">
                                {language === 'en' 
                                    ? 'Listen to a quick overview of how to use JalDrishti AI.' 
                                    : 'जल दृष्टि एआई का उपयोग कैसे करें, इसका एक त्वरित अवलोकन सुनें।'}
                            </p>
                            
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
                                    <><Square size={20} className="fill-current" /> {language === 'en' ? 'Stop Guide' : 'गाइड रोकें'}</>
                                ) : (
                                    <><Play size={20} className="fill-current" /> {language === 'en' ? 'Play Guide' : 'गाइड चलाएं'}</>
                                )}
                            </button>
                            
                            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-left">
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                    "{GUIDE_TEXT[language]}"
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
