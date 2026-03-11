import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, X, Send, Bot, Loader2, Volume2, VolumeX, Copy, Check, ChevronDown, ChevronUp, Droplets, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { chatWithClaude, playGeminiTTS } from '../lib/claude';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AssistantProps {
    isOpen: boolean;
    onClose: () => void;
    initialMessage?: string;
    onNavigate?: (tab: string) => void;
}

const QUICK_CARDS = [
    { icon: <AlertTriangle size={18} className="text-amber-500" />, text: "My water smells bad", query: "My tap water has a strange smell. What could be the reason and is it safe?" },
    { icon: <Droplets size={18} className="text-yellow-500" />, text: "Water looks discolored", query: "The water coming from my tap is yellowish/brown. What should I do?" },
    { icon: <ShieldCheck size={18} className="text-emerald-500" />, text: "Check if water is safe", query: "How can I check if my home water is safe for drinking?" },
    { icon: <Info size={18} className="text-blue-500" />, text: "High TDS problem", query: "My water TDS is very high. What are the health effects and how to fix it?" }
];

export const Assistant: React.FC<AssistantProps> = ({ isOpen, onClose, initialMessage, onNavigate }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'model',
            text: "Hello! I am JalDrishti, your water governance assistant. \n\nYou can ask me about:\n💧 Water quality alerts\n📜 Government regulations\n📸 How to analyze a sample",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [showEmojis, setShowEmojis] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [voiceHistory, setVoiceHistory] = useState<string[]>([]);
    const [selectedLang, setSelectedLang] = useState('en-IN');
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [showArsenicAlert, setShowArsenicAlert] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const playResponse = useCallback(async (text: string) => {
        if (!audioEnabled) return;
        
        setIsSpeaking(true);
        playGeminiTTS(
            text.replace(/[*#_`]/g, ''),
            () => setIsSpeaking(true),
            () => setIsSpeaking(false),
            selectedLang
        );
    }, [audioEnabled, selectedLang]);

    const handleSend = useCallback(async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isLoading) return;

        const lowerText = textToSend.toLowerCase();
        if (lowerText.includes('bihar') || lowerText.includes('west bengal') || lowerText.includes('jharkhand') || lowerText.includes('assam')) {
            setShowArsenicAlert(true);
        }

        setIsSent(true);
        setTimeout(() => setIsSent(false), 1500);

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            let apiHistory = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
            apiHistory.push({ role: 'user', content: userMsg.text });
            
            // Anthropic requires alternating roles starting with user
            const compactedHistory: {role: string, content: string}[] = [];
            for (const msg of apiHistory) {
                if (compactedHistory.length === 0) {
                    if (msg.role === 'user') compactedHistory.push(msg);
                } else {
                    const lastMsg = compactedHistory[compactedHistory.length - 1];
                    if (lastMsg.role === msg.role) {
                        lastMsg.content += '\n\n' + msg.content;
                    } else {
                        compactedHistory.push(msg);
                    }
                }
            }
            
            const responseText = await chatWithClaude(compactedHistory, selectedLang.startsWith('hi') ? 'hi' : 'en', () => {});

            const modelMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText || "I couldn't process that request.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, modelMsg]);
            
            if (responseText) {
                playResponse(responseText);
            }

        } catch (error) {
            console.error(error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, selectedLang, playResponse]);

    const handleFinalResult = useCallback((text: string) => {
        const cleanText = text.trim();
        if (cleanText) {
            setVoiceHistory(prev => [cleanText, ...prev].slice(0, 5));
            
            const lowerText = cleanText.toLowerCase();
            if (lowerText.includes("analyze my water") && onNavigate) {
                onNavigate('analyze');
                onClose();
                return;
            }
            if (lowerText.includes("show india map") && onNavigate) {
                onNavigate('map');
                onClose();
                return;
            }
            if (lowerText.includes("clear chat")) {
                setMessages([]);
                return;
            }
            
            setInput(cleanText);
            handleSend(cleanText);
        }
    }, [onNavigate, onClose, handleSend]);

    const handleToast = useCallback((msg: string) => {
        console.log(msg);
    }, []);

    const { voiceState, liveTranscript, startListening, stopListening } = useSpeechRecognition(
        selectedLang.startsWith('hi') ? 'hi' : 'en',
        handleFinalResult,
        handleToast
    );

    const isRecording = voiceState === 'listening';

    useEffect(() => {
        if (initialMessage && isOpen) {
            handleSend(initialMessage);
        }
    }, [initialMessage, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isLoading]);

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    const toggleListening = () => {
        if (isRecording) {
            stopListening();
        } else {
            startListening();
        }
    };

    const addEmoji = (emoji: string) => {
        if (input.length < 500) {
            setInput(prev => prev + emoji);
        }
        setShowEmojis(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>

            {/* Bottom Sheet */}
            <div className="bg-gov-card dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-2xl mx-auto rounded-t-[20px] shadow-2xl pointer-events-auto transform transition-transform duration-300 animate-slide-up flex flex-col h-[85vh] md:h-[700px] border-t border-white/20 dark:border-slate-700">
                
                {/* Handle / Header */}
                <div className="flex justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                    <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                </div>
                <div className="px-8 pb-4 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl text-white shadow-subtle transition-colors bg-gov-navy relative">
                            <Bot size={28} />
                            {isSpeaking && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>}
                        </div>
                        <div>
                            <h3 className="font-bold text-gov-navy dark:text-white text-xl font-display">
                                JalDrishti Assistant
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {isSpeaking ? 'Speaking...' : 'Online'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            className={`p-2 rounded-full transition-all ${audioEnabled ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}
                            title={audioEnabled ? "Mute Voice" : "Enable Voice"}
                        >
                            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                        <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Quick Cards */}
                {messages.length === 1 && (
                    <div className="px-6 pt-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                        {QUICK_CARDS.map((card, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleSend(card.query)}
                                className="flex-shrink-0 flex items-center gap-2 bg-gov-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-subtle"
                            >
                                {card.icon} {card.text}
                            </button>
                        ))}
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-gov-bg dark:bg-slate-950/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-enter`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center mr-3 shrink-0 self-end mb-5">
                                    <Bot size={16} className="text-gov-teal dark:text-blue-400" />
                                </div>
                            )}
                            
                            <div className={`max-w-[80%] relative group ${
                                msg.role === 'user' 
                                    ? 'bg-gov-navy text-white rounded-3xl rounded-br-sm shadow-subtle'
                                    : 'bg-gov-light-surface dark:bg-slate-800 border-l-4 border-gov-teal text-slate-700 dark:text-slate-200 rounded-3xl rounded-bl-sm shadow-subtle'
                            }`}>
                                <div className="p-4 md:p-5">
                                    {msg.role === 'user' ? (
                                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    ) : (
                                        <ExpandableMessage text={msg.text} />
                                    )}
                                </div>
                                
                                <div className={`flex items-center gap-2 px-4 pb-2 text-[10px] font-medium ${msg.role === 'user' ? 'justify-end text-blue-100' : 'justify-start text-slate-400 dark:text-slate-500'}`}>
                                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}
                                    
                                    {msg.role === 'model' && (
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(msg.text)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                            title="Copy message"
                                        >
                                            <Copy size={12} />
                                        </button>
                                    )}
                                </div>
                                {msg.role === 'model' && (
                                    <div className="px-4 pb-3 flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Powered by</span>
                                        <span className="text-[10px] font-bold text-[#D97757]">Anthropic Claude</span>
                                    </div>
                                )}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ml-3 shrink-0 self-end mb-5 text-xs font-bold text-slate-600 dark:text-slate-300">
                                    You
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {showArsenicAlert && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4 flex gap-3 shadow-sm"
                        >
                            <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                            <div>
                                <p className="text-sm font-bold text-red-800 dark:text-red-300">Arsenic Zone Detected</p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">This region has high groundwater arsenic levels. Do not drink borewell water without RO filtration.</p>
                            </div>
                        </motion.div>
                    )}

                    {isLoading && (
                        <div className="flex justify-start message-enter">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center mr-3 shrink-0 self-end mb-5">
                                <Bot size={16} className="text-gov-teal dark:text-blue-400" />
                            </div>
                            <div className="bg-gov-light-surface dark:bg-slate-800 border-l-4 border-amber-500 px-6 py-5 rounded-3xl rounded-bl-sm shadow-subtle flex items-center gap-2 animate-shimmer">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Voice Recording Overlay */}
                <AnimatePresence>
                    {isRecording && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-24 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 z-10"
                        >
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="flex flex-wrap justify-center gap-2 mb-2">
                                    {[{id: 'en-IN', label: 'English'}, {id: 'hi-IN', label: 'Hindi'}, {id: 'bn-IN', label: 'Bengali'}, {id: 'te-IN', label: 'Telugu'}, {id: 'ta-IN', label: 'Tamil'}, {id: 'mr-IN', label: 'Marathi'}].map(lang => (
                                        <button 
                                            key={lang.id}
                                            onClick={() => setSelectedLang(lang.id)}
                                            className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${selectedLang === lang.id ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-300' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-end gap-1 h-12">
                                    {[1, 2, 3, 4, 5].map((i) => {
                                        const height = Math.max(20, Math.min(100, Math.random() * 100));
                                        return (
                                            <motion.div 
                                                key={i}
                                                animate={{ height: `${height}%` }}
                                                transition={{ type: 'tween', duration: 0.2, repeat: Infinity, repeatType: 'reverse' }}
                                                className="w-2 bg-blue-500 rounded-full"
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 font-medium">Listening...</p>
                                <p className="text-sm text-blue-500 font-medium h-6">{liveTranscript}</p>
                                <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
                                    Commands: "Analyze my water" • "Show India map" • "Clear chat"
                                </div>
                                {voiceHistory.length > 0 && (
                                    <div className="mt-4 w-full">
                                        <p className="text-xs font-bold text-slate-400 mb-2 text-center">Recent Voice Inputs</p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {voiceHistory.map((h, i) => (
                                                <button key={i} onClick={() => { stopListening(); handleSend(h); }} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                                                    "{h}"
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-gov-card dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <div className="relative flex items-end gap-2">
                        <div className="relative">
                            <button 
                                onClick={toggleListening}
                                className={`p-4 rounded-full transition-all ${
                                    isRecording 
                                        ? 'bg-red-500 text-white mic-pulse' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`} 
                                aria-label="Voice Input"
                            >
                                <Mic size={22} />
                            </button>
                        </div>
                        
                        <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-3xl border border-transparent focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 transition-all">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask about water quality..."
                                className="w-full bg-transparent border-none px-5 py-4 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 resize-none max-h-32 min-h-[56px] no-scrollbar"
                                rows={1}
                                aria-label="Chat input"
                            />
                            
                            <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowEmojis(!showEmojis)}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        aria-label="Emojis"
                                    >
                                        💧
                                    </button>
                                    {showEmojis && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2 flex gap-1 z-20">
                                            {['💧', '🚰', '🔬', '🧪', '⚗️', '🌊'].map(emoji => (
                                                <button key={emoji} onClick={() => addEmoji(emoji)} className="hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded text-lg">
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className={`p-4 rounded-full transition-all shadow-subtle flex-shrink-0 ${
                                isSent 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gov-navy text-white hover:shadow-subtle-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
                            }`}
                            aria-label="Send message"
                        >
                            {isSent ? <Check size={22} /> : <Send size={22} className="ml-1" />}
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-2">
                        <span className="text-[10px] text-slate-400 font-medium">Press Enter to send</span>
                        <span className={`text-[10px] font-medium ${input.length >= 500 ? 'text-red-500' : 'text-slate-400'}`}>
                            {input.length}/500
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExpandableMessage = ({ text }: { text: string }) => {
    const [expanded, setExpanded] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const isLong = text.split('\n').length > 4 || text.length > 250;
    
    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.slice(i, i + 3));
                i += 3;
            } else {
                clearInterval(timer);
            }
        }, 5); 
        return () => clearInterval(timer);
    }, [text]);

    const content = expanded ? displayedText : (isLong ? displayedText.slice(0, 250) + '...' : displayedText);

    return (
        <div className="flex flex-col">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
            {isLong && displayedText.length === text.length && (
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline w-fit"
                >
                    {expanded ? <>Show less <ChevronUp size={14}/></> : <>Show more <ChevronDown size={14}/></>}
                </button>
            )}
        </div>
    );
};
