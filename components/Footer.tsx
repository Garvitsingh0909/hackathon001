import React, { useState } from 'react';
import { Shield, Bot, Accessibility, Globe, Info, MessageSquare } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export const Footer = ({ onOpenFeedback, language }: { onOpenFeedback: () => void, language: 'en' | 'hi' }) => {
    return (
        <div className="mt-12">
            {/* Trust Section */}
            <div className="bg-[#F0F4F8] dark:bg-slate-800/50 py-4 border-y border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-y-4 gap-x-8 md:gap-x-12">
                    <div className="flex items-center gap-2 text-[#546E7A] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Shield size={16} />
                        <span>{language === 'en' ? 'End-to-End Encrypted' : 'एंड-टू-एंड एन्क्रिप्टेड'}</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="flex items-center gap-2 text-[#546E7A] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Bot size={16} />
                        <span>{language === 'en' ? 'Powered by Claude' : 'Claude द्वारा संचालित'}</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="flex items-center gap-2 text-[#546E7A] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Accessibility size={16} />
                        <span>WCAG 2.1 AA</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="flex items-center gap-2 text-[#546E7A] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Globe size={16} />
                        <span>{language === 'en' ? 'Made for Bharat' : 'भारत के लिए निर्मित'}</span>
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
                        <p className="text-sm text-slate-400 max-w-sm">{language === 'en' ? "Empowering Every Citizen's Voice in Water Governance" : "जल प्रशासन में हर नागरिक की आवाज को सशक्त बनाना"}</p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-4">
                        <button 
                            onClick={onOpenFeedback}
                            className="flex items-center gap-2 text-sm text-gov-teal hover:text-white transition-colors"
                        >
                            <MessageSquare size={16} />
                            {language === 'en' ? 'Submit Feedback' : 'प्रतिक्रिया जमा करें'}
                        </button>
                        <div className="text-center md:text-right">
                            <p className="text-sm text-slate-300 font-medium">{language === 'en' ? 'Built by The OG Boys' : 'द ओजी बॉयज़ द्वारा निर्मित'}</p>
                            <p className="text-xs text-slate-500 mt-1">------- </p>
                        </div>
                    </div>
                </div>
                
                {/* Data Simulation Disclaimer */}
                <div className="bg-blue-500/5 border-y border-blue-500/10 py-8 px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                            <Info size={12} /> {language === 'en' ? 'Data Simulation Active' : 'डेटा सिमुलेशन सक्रिय'}
                        </div>
                        <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                            {language === 'en' ? 'JalDrishti is currently in active development.' : 'जल दृष्टि वर्तमान में सक्रिय विकास में है।'}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            {language === 'en' ? 'To demonstrate platform capabilities, some data points are simulated. Visual analysis is a preliminary screening tool and should be verified with laboratory testing for critical safety decisions.' : 'प्लेटफ़ॉर्म क्षमताओं को प्रदर्शित करने के लिए, कुछ डेटा बिंदुओं का अनुकरण किया जाता है। दृश्य विश्लेषण एक प्रारंभिक जांच उपकरण है और महत्वपूर्ण सुरक्षा निर्णयों के लिए प्रयोगशाला परीक्षण के साथ सत्यापित किया जाना चाहिए।'}
                        </p>
                    </div>
                </div>

                <div className="pt-8 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">&copy; 2026 JalDrishti. {language === 'en' ? 'All rights reserved.' : 'सर्वाधिकार सुरक्षित।'}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
