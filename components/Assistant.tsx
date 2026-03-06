import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Send, Bot, ChevronUp, Loader2, Code, Droplets, Volume2, VolumeX } from 'lucide-react';
import { chatNormal, chatCode, generateSpeech, transcribeAudio } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Assistant: React.FC<AssistantProps> = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState<'water' | 'code'>('water');
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
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Reset messages when switching modes
    const toggleMode = () => {
        const newMode = mode === 'water' ? 'code' : 'water';
        setMode(newMode);
        setMessages([
            {
                id: Date.now().toString(),
                role: 'model',
                text: newMode === 'water' 
                    ? "Hello! I am JalDrishti, your water governance assistant. \n\nYou can ask me about:\n💧 Water quality alerts\n📜 Government regulations\n📸 How to analyze a sample"
                    : "💻 **Code Fixing Assistant Active**\n\nPaste your broken code here, and I'll debug, fix, and optimize it for you.",
                timestamp: new Date()
            }
        ]);
    };

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    try {
                        setIsLoading(true);
                        const transcription = await transcribeAudio(base64Audio);
                        if (transcription) {
                            setInput(transcription);
                            handleSend(transcription);
                        }
                    } catch (error) {
                        console.error("Transcription error:", error);
                    } finally {
                        setIsLoading(false);
                    }
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const toggleListening = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const playResponse = async (text: string) => {
        if (!audioEnabled || mode === 'code') return;
        
        try {
            setIsSpeaking(true);
            // Strip markdown for speech
            const cleanText = text.replace(/[*#_`]/g, '');
            const base64Audio = await generateSpeech(cleanText);
            
            if (!base64Audio) throw new Error("No audio generated");

            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            }
            
            // Decode raw PCM (Int16) data from Gemini TTS
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) {
                // Convert Int16 to Float32 [-1.0, 1.0]
                channelData[i] = dataInt16[i] / 32768.0;
            }
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsSpeaking(false);
            source.start(0);
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
        }
    };

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isLoading) return;

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
            const apiHistory = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
            
            let responseText;
            if (mode === 'code') {
                responseText = await chatCode(apiHistory, userMsg.text);
            } else {
                responseText = await chatNormal(apiHistory, userMsg.text);
            }

            const modelMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText || "I couldn't process that request.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, modelMsg]);
            
            // Play audio response
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
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>

            {/* Bottom Sheet */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-2xl mx-auto rounded-t-[2.5rem] shadow-2xl pointer-events-auto transform transition-transform duration-300 animate-slide-up flex flex-col h-[85vh] md:h-[700px] border-t border-white/20 dark:border-slate-700">
                
                {/* Handle / Header */}
                <div className="flex justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                    <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                </div>
                <div className="px-8 pb-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl text-white shadow-lg transition-colors ${mode === 'code' ? 'bg-gradient-to-br from-purple-600 to-indigo-700 shadow-purple-500/30' : 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-500/30'}`}>
                            {mode === 'code' ? <Code size={28} /> : <Bot size={28} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-xl font-display">
                                {mode === 'code' ? 'Code Fixer' : 'JalDrishti Assistant'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${isSpeaking ? 'bg-green-500' : (mode === 'code' ? 'bg-purple-500' : 'bg-blue-500')}`}></span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {isSpeaking ? 'Speaking...' : 'Gemini 2.5 Flash'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            className={`p-2 rounded-full transition-all ${audioEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
                            title={audioEnabled ? "Mute Voice" : "Enable Voice"}
                        >
                            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                        <button 
                            onClick={toggleMode}
                            className={`p-2 rounded-full transition-all ${mode === 'code' ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            title={mode === 'code' ? "Switch to Water Assistant" : "Switch to Code Fixer"}
                        >
                            {mode === 'code' ? <Droplets size={20} /> : <Code size={20} />}
                        </button>
                        <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${
                                msg.role === 'user' 
                                    ? (mode === 'code' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-[#0B1F3B] dark:bg-blue-600 text-white rounded-br-sm')
                                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                            }`}>
                                {msg.role === 'user' ? (
                                    <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${mode === 'code' ? 'font-mono text-xs' : ''}`}>{msg.text}</p>
                                ) : (
                                    <TypingEffect text={msg.text} />
                                )}
                                <p className={`text-[10px] mt-2 font-medium ${msg.role === 'user' ? 'text-blue-300 dark:text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-6 py-4 rounded-3xl rounded-bl-sm flex items-center gap-3 shadow-sm">
                                <Loader2 className={`animate-spin ${mode === 'code' ? 'text-purple-600' : 'text-blue-600'} dark:text-blue-400`} size={20} />
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-8 md:pb-6">
                    <div className="relative flex items-center gap-3">
                        <div 
                            onClick={toggleListening}
                            className={`p-4 rounded-2xl cursor-pointer transition-colors group ${
                                isRecording 
                                    ? 'bg-red-500 text-white animate-pulse' 
                                    : (mode === 'code' ? 'bg-purple-50 text-purple-500 hover:bg-purple-100' : 'bg-red-50 text-red-500 hover:bg-red-100')
                            }`} 
                            title="Voice Input"
                        >
                            <Mic size={24} className={`transition-transform ${!isRecording && 'group-hover:scale-110'}`} />
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isRecording ? "Listening..." : (mode === 'code' ? "Paste code to fix..." : "Ask about water quality, regulations...")}
                            className={`flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-lg ${mode === 'code' ? 'focus:ring-purple-500 font-mono text-sm' : 'focus:ring-blue-500'}`}
                            autoFocus
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className={`p-4 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${mode === 'code' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20' : 'bg-[#0B1F3B] hover:bg-blue-900 shadow-blue-900/20'}`}
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TypingEffect = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        // Much faster typing for "fast" feel
        const timer = setInterval(() => {
            if (i < text.length) {
                // Add multiple characters at once for speed
                setDisplayedText((prev) => prev + text.slice(i, i + 3));
                i += 3;
            } else {
                clearInterval(timer);
            }
        }, 5); 

        return () => clearInterval(timer);
    }, [text]);

    return <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{displayedText}</p>;
};
