import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Send, Bot, ChevronUp, Loader2 } from 'lucide-react';
import { chatNormal } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Assistant: React.FC<AssistantProps> = ({ isOpen, onClose }) => {
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const apiHistory = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
            const responseText = await chatNormal(apiHistory, userMsg.text);

            const modelMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText || "I couldn't process that request.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, modelMsg]);
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
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                            <Bot size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-xl font-display">JalDrishti Assistant</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gemini 2.5 Flash</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-[#0B1F3B] dark:bg-blue-600 text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                            }`}>
                                {msg.role === 'user' ? (
                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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
                                <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={20} />
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-8 md:pb-6">
                    <div className="relative flex items-center gap-3">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group" title="Voice Input (Simulated)">
                            <Mic size={24} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about water quality, regulations..."
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-lg"
                            autoFocus
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="p-4 bg-[#0B1F3B] dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-900 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-1"
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
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 10); // Faster typing

        return () => clearInterval(timer);
    }, [text]);

    return <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{displayedText}</p>;
};
