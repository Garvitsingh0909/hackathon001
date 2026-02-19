import React from 'react';

export const Footer = () => {
    return (
        <footer className="border-t border-slate-200 bg-white mt-12 mb-20 md:mb-0">
            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h3 className="text-slate-900 font-bold text-sm tracking-tight mb-1">JALDRISHTI AI</h3>
                    <p className="text-xs text-slate-500">Intelligent River Basin Monitoring System</p>
                </div>
                <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                    <a href="#" className="hover:text-blue-900 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-900 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-blue-900 transition-colors">Support</a>
                </div>
                <div className="text-[10px] text-slate-400 text-center md:text-right">
                    <p>&copy; 2026 JalDrishti Governance Initiative.</p>
                </div>
            </div>
        </footer>
    );
};