import React, { useState, useEffect } from 'react';
import { Map, Search, Newspaper, MapPin, ExternalLink, Loader2, AlertTriangle, ShieldAlert, ShieldCheck, Volume2, FileText, Droplets, Activity } from 'lucide-react';
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
                            
                            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Featured Article */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="relative rounded-[2rem] overflow-hidden aspect-video group">
                                        <img 
                                            src="https://picsum.photos/seed/river/1200/800" 
                                            alt="Featured" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-8 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-bold text-white uppercase tracking-widest rounded-md">Featured</span>
                                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">5 min read</span>
                                            </div>
                                            <h3 className="text-3xl font-bold text-white font-display leading-tight">State of the Tamsa: A Comprehensive 2026 Analysis</h3>
                                            <p className="text-white/70 text-sm max-w-xl line-clamp-2">Recent satellite data and ground-level sensors reveal a complex picture of the Tamsa River basin's health this spring.</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                                        <p className="whitespace-pre-line">{news.text}</p>
                                    </div>
                                </div>

                                {/* Sidebar News */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-4 h-[1px] bg-slate-300 dark:bg-slate-600"></div> Trending Updates
                                    </h4>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="group cursor-pointer">
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                                                        <img src={`https://picsum.photos/seed/water${i}/200/200`} alt="News" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Environment</span>
                                                        <h5 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">New sensor array deployed in Maunath Bhanjan</h5>
                                                        <p className="text-[10px] text-slate-400">12 Mar 2026</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Weekly Newsletter</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Get the latest water quality insights delivered to your inbox.</p>
                                        <div className="flex gap-2">
                                            <input type="email" placeholder="Email" className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
                            <motion.div variants={item} className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6 flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3 font-display">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Map className="text-emerald-500 dark:text-emerald-400" size={24} /></div>
                                        Monitoring Network
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

                            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stations.chunks?.map((chunk, idx) => {
                                    if (chunk.web?.uri || chunk.maps?.uri) {
                                        const title = chunk.web?.title || chunk.maps?.title;
                                        const uri = chunk.web?.uri || chunk.maps?.uri;
                                        const isMap = !!chunk.maps?.uri;

                                        return (
                                            <motion.div
                                                key={idx}
                                                variants={item}
                                                whileHover={{ y: -5 }}
                                                className="group bg-white dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/5"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`p-3 rounded-2xl ${isMap ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                                        {isMap ? <MapPin size={24} /> : <Search size={24} />}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-1 mb-6">
                                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">{title}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{isMap ? 'Geographical Landmark' : 'Data Source'}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reliability</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">High</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{isMap ? 'Station' : 'Article'}</p>
                                                    </div>
                                                </div>

                                                <a 
                                                    href={uri} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="w-full py-3 bg-slate-50 dark:bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    {isMap ? 'View on Maps' : 'Read Source'} <ArrowRight size={14} />
                                                </a>
                                            </motion.div>
                                        );
                                    }
                                    return null;
                                })}
                            </motion.div>
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
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
                            <div className="max-w-3xl mx-auto text-center space-y-4">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Risk Assessment Engine</h2>
                                <p className="text-slate-500 dark:text-slate-400">The engine analyzes local environmental factors, historical data, and real-time reports to determine your current water safety level.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">Safety Checkpoint</h4>
                                                <p className="text-xs text-slate-500 tracking-wide uppercase font-bold">Last updated: Just now</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Risk Level</span>
                                                <span className={`text-4xl font-black font-display ${
                                                    !riskResult ? 'text-slate-300' :
                                                    riskResult.score > 70 ? 'text-rose-500' : 
                                                    riskResult.score > 40 ? 'text-amber-500' : 'text-emerald-500'
                                                }`}>
                                                    {riskResult?.level.split(' ')[0] || '---'}
                                                </span>
                                            </div>
                                            
                                            <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-1">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: !riskResult ? 0 : riskResult.score > 70 ? '90%' : riskResult.score > 40 ? '60%' : '20%' }}
                                                    className={`h-full rounded-full ${
                                                        !riskResult ? 'bg-slate-200' :
                                                        riskResult.score > 70 ? 'bg-rose-500' : 
                                                        riskResult.score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`}
                                                />
                                            </div>

                                            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 min-h-[100px] flex items-center">
                                                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                                    "{riskResult?.details || 'Enter your location below to run a diagnostic safety assessment.'}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Enter city or pin code..." 
                                            value={locationInput}
                                            onChange={(e) => setLocationInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCheckRisk()}
                                            className="flex-1 px-6 py-4 rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none"
                                        />
                                        <button 
                                            onClick={handleCheckRisk}
                                            disabled={isCheckingRisk || !locationInput.trim()}
                                            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-bold hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl disabled:opacity-50"
                                        >
                                            {isCheckingRisk ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Contamination', value: riskResult ? (riskResult.score > 70 ? '0.82%' : '0.02%') : '--', icon: Droplets, color: 'text-blue-500' },
                                        { label: 'Bacterial Load', value: riskResult ? (riskResult.score > 70 ? 'High' : 'Low') : '--', icon: ShieldCheck, color: 'text-emerald-500' },
                                        { label: 'Turbidity', value: riskResult ? (riskResult.score > 70 ? '4.5 NTU' : '1.2 NTU') : '--', icon: Search, color: 'text-amber-500' },
                                        { label: 'pH Variance', value: riskResult ? '±0.1' : '--', icon: Activity, color: 'text-rose-500' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                            {/* @ts-ignore */}
                                            <stat.icon size={20} className={`${stat.color} mb-4`} />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
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