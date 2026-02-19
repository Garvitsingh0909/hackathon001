import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Send, Bot, ChevronUp, Loader2 } from 'lucide-react';
import { chatWithThinking } from '../services/geminiService';
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
            text: "Welcome to JalDrishti Assistant. Ask me about river health, recent alerts, or regulatory compliance.",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            const apiHistory = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
            const responseText = await chatWithThinking(apiHistory, userMsg.text);

            const modelMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText || "I couldn't process that request.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, modelMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>

            {/* Bottom Sheet */}
            <div className="bg-white w-full max-w-2xl mx-auto rounded-t-3xl shadow-2xl pointer-events-auto transform transition-transform duration-300 animate-slide-up flex flex-col h-[85vh] md:h-[600px]">
                
                {/* Handle / Header */}
                <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>
                <div className="px-6 pb-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Assistant</h3>
                            <p className="text-xs text-slate-500">Gemini 3.0 Pro Thinking</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-blue-900 text-white rounded-br-none' 
                                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                            }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                                <span className="text-xs text-slate-400 font-medium ml-2">Reasoning...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 pb-8 md:pb-4">
                    <div className="relative flex items-center gap-3">
                        <div className="p-3 bg-red-50 text-red-500 rounded-full cursor-pointer hover:bg-red-100 transition-colors" title="Voice Input (Simulated)">
                            <Mic size={20} />
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a query or tap mic..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-5 py-3.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            autoFocus
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isThinking}
                            className="p-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};