import React from 'react';
import { Shield, Bot, Accessibility, Globe, Info } from 'lucide-react';

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
                        <span>Powered by Gemini</span>
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
                            <h3 className="text-white font-bold text-lg tracking-tight font-display">JalDrishti<span className="text-gov-teal">.Live</span></h3>
                        </div>
                        <p className="text-sm text-slate-400 max-w-sm">Empowering Every Citizen's Voice in Water Governance</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-sm text-slate-300 font-medium">Built by The OG Boys</p>
                        <p className="text-xs text-slate-500 mt-1">Sankalp Innovation Challenge 2026</p>
                    </div>
                </div>
                
                {/* Data Simulation Disclaimer */}
                <div className="bg-blue-500/5 border-y border-blue-500/10 py-8 px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                            <Info size={12} /> Data Simulation Active
                        </div>
                        <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                            JalDrishti is currently in active development.
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            To demonstrate platform capabilities, some data points are simulated. 
                            Visual analysis is a preliminary screening tool and should be verified with laboratory testing for critical safety decisions. 
                        </p>
                    </div>
                </div>

                <div className="pt-8 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">&copy; 2026 JalDrishti. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};