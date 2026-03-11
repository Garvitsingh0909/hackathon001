import React from 'react';
import { Shield, Bot, Accessibility, Globe } from 'lucide-react';

export const Footer = () => {
    return (
        <div className="mt-12">
            {/* Trust Section */}
            <div className="bg-[#F0F4F8] dark:bg-slate-800/50 py-4 border-y border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-y-4 gap-x-8 md:gap-x-12">
                    <div className="flex items-center gap-2 text-[#546E7A] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Shield size={16} />
                        <span>End-to-End Encrypted</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="flex items-center gap-2 text-[#546E7A] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Bot size={16} />
                        <span>Gemini AI Powered</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="flex items-center gap-2 text-[#546E7A] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Accessibility size={16} />
                        <span>WCAG 2.1 AA</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="flex items-center gap-2 text-[#546E7A] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Globe size={16} />
                        <span>Made for Bharat</span>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <footer className="bg-gov-dark-navy border-t border-gov-teal pb-24 md:pb-8 transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <img src="/logo.svg" alt="JalDrishti AI" className="h-8 w-8 object-contain" />
                            <h3 className="text-white font-bold text-lg tracking-tight font-display">JalDrishti<span className="text-gov-teal">.AI</span></h3>
                        </div>
                        <p className="text-sm text-slate-400 max-w-sm">Empowering Every Citizen's Voice in Water Governance</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-sm text-slate-300 font-medium">Built by The OG Boys</p>
                        <p className="text-xs text-slate-500 mt-1">Sankalp Innovation Challenge 2026</p>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-6 mt-4 px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <p className="text-[10px] text-gov-teal uppercase tracking-[0.2em] font-bold">
                            Disclaimer: Demo Mode & Mock Data
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            JalDrishti AI is currently in prototype phase. Some data points shown in the dashboard and maps may be simulated for demonstration purposes. AI-based visual analysis should be verified with laboratory testing for critical safety decisions.
                        </p>
                        <p className="text-xs text-slate-500 pb-4">&copy; 2026 JalDrishti AI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};