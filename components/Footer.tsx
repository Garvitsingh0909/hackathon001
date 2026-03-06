import React from 'react';

export const Footer = () => {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12 pb-24 md:pb-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h3 className="text-slate-900 dark:text-white font-bold text-sm tracking-tight mb-1 font-display">JALDRISHTI AI <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">v2.0.0</span></h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Web Speech API + BIS IS:10500</p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How to use</a>
                    <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Water Safety FAQs</a>
                    <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Report a Bug</a>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center md:text-right flex flex-col items-center md:items-end gap-1">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-medium border border-slate-200 dark:border-slate-700">Made for 🇮🇳 India</span>
                    <p className="mt-2">&copy; 2026 JalDrishti Governance Initiative.</p>
                </div>
            </div>
        </footer>
    );
};