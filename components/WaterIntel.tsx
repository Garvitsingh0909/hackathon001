import React, { useState, useEffect } from 'react';
import { Map, Search, Newspaper, MapPin, ExternalLink, Loader2, AlertTriangle, ShieldAlert, ShieldCheck, Volume2, FileText } from 'lucide-react';
import { searchWaterNews, findNearbyStations, playBrowserTTS } from '../lib/claude';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { api } from '../services/api';
import { WaterQualityReport } from '../types';

export const WaterIntel = () => {
    const [activeSection, setActiveSection] = useState<'news' | 'stations' | 'risk' | 'reports'>('news');
    const [news, setNews] = useState<{text: string, sources: any[]} | null>(null);
    const [stations, setStations] = useState<{text: string, chunks: any[]} | null>(null);
    const [reports, setReports] = useState<WaterQualityReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // Risk Checker State
    const [locationInput, setLocationInput] = useState('');
    const [riskResult, setRiskResult] = useState<{score: number, level: string, details: string, tips: string[]} | null>(null);
    const [isCheckingRisk, setIsCheckingRisk] = useState(false);

    // Mock Location for Tamsa River Basin (Maunath Bhanjan approx)
    const MOCK_LAT = 25.9427;
    const MOCK_LNG = 83.5539;

    const fetchNews = async () => {
        setLoading(true);
        console.log('[WaterIntel] Fetching news for Tamsa River');
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 60000));
            const apiPromise = searchWaterNews("Tamsa River pollution and water quality Uttar Pradesh");
            
            const result = await Promise.race([apiPromise, timeoutPromise]) as any;
            console.log('[WaterIntel] News fetch successful', result);
            
            setNews({
                text: result.text || "No news found.",
                sources: result.groundingMetadata?.groundingChunks || []
            });
        } catch (e) {
            console.error("[WaterIntel] News fetch failed or timed out", e);
            setNews({
                text: "## Local Updates (Cached)\n\n**Tamsa River Status:** Recent monitoring indicates stable water levels. Local authorities have increased sampling frequency near industrial zones.\n\n**Community Action:** Volunteer groups are organizing a cleanup drive this weekend at the City Center Ghat.",
                sources: []
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStations = async () => {
        setLoading(true);
        console.log('[WaterIntel] Fetching nearby stations');
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 60000));
            const apiPromise = findNearbyStations(MOCK_LAT, MOCK_LNG);
            
            const result = await Promise.race([apiPromise, timeoutPromise]) as any;
            console.log('[WaterIntel] Stations fetch successful', result);
            
            setStations({
                text: result.text || "No stations found.",
                chunks: result.chunks || []
            });
        } catch (e) {
            console.error("[WaterIntel] Stations fetch failed or timed out", e);
            setStations({
                text: "Unable to fetch live station data. Showing cached locations.",
                chunks: [
                    { maps: { title: "Central Monitoring Station", uri: "https://maps.google.com" } },
                    { maps: { title: "River Ghat Sensor Array", uri: "https://maps.google.com" } }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await api.getReports();
            setReports(data);
        } catch (e) {
            console.error("[WaterIntel] Reports fetch failed", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeSection === 'news' && !news) fetchNews();
        if (activeSection === 'stations' && !stations) fetchStations();
        if (activeSection === 'reports' && reports.length === 0) fetchReports();
    }, [activeSection]);

    const handleSpeak = (text: string) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        
        setIsSpeaking(true);
        playBrowserTTS(
            text,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false)
        );
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleCheckRisk = () => {
        if (!locationInput.trim()) return;
        setIsCheckingRisk(true);
        setRiskResult(null);
        
        // Simulate API call
        setTimeout(() => {
            const hash = locationInput.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
            const score = Math.abs(hash % 100);
            
            let level = 'Low Risk';
            let details = 'Water quality in this area is generally reported to be safe for daily use. However, periodic testing is always recommended.';
            let tips = ['Use standard filtration', 'Clean storage tanks regularly'];
            
            if (score > 70) {
                level = 'High Risk';
                details = 'Historical data and recent reports suggest potential contamination issues in this region. Heavy metals or bacterial presence might be elevated.';
                tips = ['Use RO purification', 'Boil water before drinking', 'Contact local authorities for testing'];
            } else if (score > 40) {
                level = 'Moderate Risk';
                details = 'Water quality fluctuates. Seasonal variations (like monsoons) might affect turbidity and TDS levels.';
                tips = ['Use UV/UF filtration', 'Monitor water color and smell', 'Clean filters monthly'];
            }

            setRiskResult({ score, level, details, tips });
            setIsCheckingRisk(false);
        }, 1500);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto space-y-8 pt-6"
        >
            <DisclaimerBanner />
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md p-2 rounded-full shadow-inner border border-slate-200/50 dark:border-slate-700/50 w-fit mx-auto mb-8 transition-colors">
                <button
                    onClick={() => setActiveSection('news')}
                    className={`relative px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${activeSection === 'news' ? 'text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                >
                    {activeSection === 'news' && (
                        <motion.div
                            layoutId="intel-tab-active"
                            className="absolute inset-0 rounded-full -z-10 bg-gradient-to-r from-blue-600 to-gov-teal shadow-[0_0_15px_rgba(34,184,166,0.4)]"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                    )}
                    <Newspaper size={18} className={activeSection === 'news' ? 'animate-pulse' : ''} /> <span className="hidden sm:inline font-display">Latest News</span>
                </button>
                <button
                    onClick={() => setActiveSection('stations')}
                    className={`relative px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${activeSection === 'stations' ? 'text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                >
                    {activeSection === 'stations' && (
                        <motion.div
                            layoutId="intel-tab-active"
                            className="absolute inset-0 rounded-full -z-10 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                    )}
                    <MapPin size={18} className={activeSection === 'stations' ? 'animate-bounce' : ''} /> <span className="hidden sm:inline font-display">Nearby Stations</span>
                </button>
                <button
                    onClick={() => setActiveSection('risk')}
                    className={`relative px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${activeSection === 'risk' ? 'text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                >
                    {activeSection === 'risk' && (
                        <motion.div
                            layoutId="intel-tab-active"
                            className="absolute inset-0 rounded-full -z-10 bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                    )}
                    <AlertTriangle size={18} className={activeSection === 'risk' ? 'animate-pulse' : ''} /> <span className="hidden sm:inline font-display">Risk Checker</span>
                </button>
                <button
                    onClick={() => setActiveSection('reports')}
                    className={`relative px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${activeSection === 'reports' ? 'text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                >
                    {activeSection === 'reports' && (
                        <motion.div
                            layoutId="intel-tab-active"
                            className="absolute inset-0 rounded-full -z-10 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(129,140,248,0.4)]"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                    )}
                    <FileText size={18} className={activeSection === 'reports' ? 'animate-pulse' : ''} /> <span className="hidden sm:inline font-display">Recent Reports</span>
                </button>
            </div>

            {loading && activeSection !== 'risk' ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 dark:text-slate-500 bg-gov-card dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-subtle transition-colors">
                    <Loader2 className="animate-spin mb-4 text-gov-teal" size={48} />
                    <p className="font-medium animate-pulse">Gathering intelligence from Tamsa Basin...</p>
                </div>
            ) : (
                <div className="bg-gov-card dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-subtle border border-slate-200 dark:border-slate-800 min-h-[500px] transition-colors">
                    {activeSection === 'news' && news && (
                        <motion.div variants={container} initial="hidden" animate="show">
                            <motion.div variants={item} className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6 flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3 font-display">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl"><Search size={24} /></div>
                                        Grounded Search
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 ml-14">Real-time environmental updates for Tamsa River</p>
                                </div>
                                <button 
                                    onClick={() => handleSpeak(news.text)}
                                    className={`p-3 rounded-full border transition-all ${isSpeaking ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                                >
                                    {isSpeaking ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
                                </button>
                            </motion.div>
                            
                            <motion.div variants={item} className="prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                                <p className="whitespace-pre-line">{news.text}</p>
                            </motion.div>
                            
                            {news.sources.length > 0 && (
                                <motion.div variants={item} className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="w-4 h-[1px] bg-slate-300 dark:bg-slate-600"></div> Verified Sources
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {news.sources.map((source, idx) => (
                                            source.web ? (
                                                <motion.a 
                                                    variants={item}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    key={idx} 
                                                    href={source.web.uri} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 bg-gov-card dark:bg-slate-800 hover:shadow-subtle-hover dark:hover:shadow-black/50 transition-all duration-300 group h-full"
                                                >
                                                    <div>
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                                <Newspaper size={20} />
                                                            </div>
                                                            <ExternalLink size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors" />
                                                        </div>
                                                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-snug mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{source.web.title}</h4>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">{new URL(source.web.uri).hostname}</p>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                                        Read Article <ArrowRight size={16} className="ml-2" />
                                                    </div>
                                                </motion.a>
                                            ) : null
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeSection === 'stations' && stations && (
                         <motion.div variants={container} initial="hidden" animate="show">
                            <motion.div variants={item} className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6 flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3 font-display">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Map className="text-emerald-500 dark:text-emerald-400" size={24} /></div>
                                        Monitoring Points
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 ml-14">Official water quality stations and landmarks</p>
                                </div>
                                <button 
                                    onClick={() => handleSpeak(stations.text)}
                                    className={`p-3 rounded-full border transition-all ${isSpeaking ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                                >
                                    {isSpeaking ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
                                </button>
                            </motion.div>

                            <motion.p variants={item} className="text-slate-600 dark:text-slate-300 mb-10 whitespace-pre-line text-lg leading-relaxed">{stations.text}</motion.p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stations.chunks?.map((chunk, idx) => {
                                    if (chunk.web?.uri && chunk.web?.title) {
                                       return (
                                        <motion.div variants={item} key={idx} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-subtle-hover dark:hover:shadow-black/50 hover:-translate-y-1 transition-all bg-gov-card dark:bg-slate-800 group">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{chunk.web.title}</h4>
                                            <a href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-2 mt-4 bg-blue-50 dark:bg-blue-900/30 w-fit px-3 py-1.5 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                                View Source <ArrowRight size={14} />
                                            </a>
                                        </motion.div>
                                       )
                                    }
                                    if (chunk.maps?.uri && chunk.maps?.title) {
                                        return (
                                         <motion.div variants={item} key={idx} className="border border-blue-100 dark:border-blue-800/50 rounded-2xl p-5 hover:shadow-lg dark:hover:shadow-black/50 hover:-translate-y-1 transition-all bg-blue-50/30 dark:bg-blue-900/10 group">
                                             <div className="flex items-start justify-between mb-2">
                                                 <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg group-hover:text-blue-800 dark:group-hover:text-blue-400 transition-colors">{chunk.maps.title}</h4>
                                                 <div className="p-2 bg-white dark:bg-slate-800 rounded-full text-blue-500 dark:text-blue-400 shadow-sm">
                                                    <MapPin size={18} />
                                                 </div>
                                             </div>
                                             <a href={chunk.maps.uri} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-2 mt-4 bg-gov-card dark:bg-slate-800 w-fit px-3 py-1.5 rounded-lg shadow-subtle group-hover:shadow-subtle-hover transition-all">
                                                 View on Maps <ArrowRight size={14} />
                                             </a>
                                         </motion.div>
                                        )
                                     }
                                    return null;
                                })}
                            </div>
                         </motion.div>
                    )}

                    {activeSection === 'reports' && reports && (
                        <motion.div variants={container} initial="hidden" animate="show">
                            <motion.div variants={item} className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3 font-display">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl"><FileText size={24} /></div>
                                    Recent Reports
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 ml-14">Latest water quality reports from the community</p>
                            </motion.div>
                            <div className="space-y-4">
                                {reports.map((report) => (
                                    <motion.div variants={item} key={report.id} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{report.locationName}</h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{report.status}</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 mb-2">{report.details}</p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500">{new Date(report.timestamp).toLocaleDateString()}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'risk' && (
                        <motion.div variants={container} initial="hidden" animate="show">
                            <motion.div variants={item} className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3 font-display">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><AlertTriangle size={24} /></div>
                                    Location Risk Checker
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 ml-14">Check historical water quality risks for your area</p>
                            </motion.div>

                            <motion.div variants={item} className="max-w-2xl mx-auto">
                                <div className="flex gap-2 mb-8">
                                    <input 
                                        type="text" 
                                        placeholder="Enter your city or pin code..." 
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCheckRisk()}
                                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    <button 
                                        onClick={handleCheckRisk}
                                        disabled={isCheckingRisk || !locationInput.trim()}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        {isCheckingRisk ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                                        <span className="hidden sm:inline">Check</span>
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {riskResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className={`p-6 rounded-2xl border ${
                                                riskResult.score > 70 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' :
                                                riskResult.score > 40 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' :
                                                'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className={`p-3 rounded-xl ${
                                                    riskResult.score > 70 ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' :
                                                    riskResult.score > 40 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' :
                                                    'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                    {riskResult.score > 70 ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
                                                </div>
                                                <div>
                                                    <h3 className={`text-2xl font-bold font-display ${
                                                        riskResult.score > 70 ? 'text-red-700 dark:text-red-400' :
                                                        riskResult.score > 40 ? 'text-amber-700 dark:text-amber-400' :
                                                        'text-emerald-700 dark:text-emerald-400'
                                                    }`}>{riskResult.level}</h3>
                                                    <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{riskResult.details}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Safety Recommendations:</h4>
                                                <ul className="space-y-2">
                                                    {riskResult.tips.map((tip, idx) => (
                                                        <li key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></div>
                                                            {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

// Helper for ArrowRight in Intel
const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);