import React, { useEffect, useState } from 'react';
import { Map, RefreshCw, Layers, AlertTriangle, ShieldCheck, FileText, MapPin, Activity, Crosshair, Radio, Zap, Sparkles, Globe, Building2, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';
import { RiverSegment, WaterQualityReport } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { MockPill } from './ui/MockPill';
import Markdown from 'react-markdown';

export const AdminMap = ({ language, embedded = false }: { language: 'en' | 'hi', embedded?: boolean }) => {
    const [segments, setSegments] = useState<RiverSegment[]>([]);
    const [reports, setReports] = useState<WaterQualityReport[]>([]);
    const [selectedItem, setSelectedItem] = useState<RiverSegment | WaterQualityReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(12);
    const [showPopup, setShowPopup] = useState(false);
    const [activeTab, setActiveTab] = useState<'segments' | 'reports'>('segments');

    // AI Insights State
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [searchInsights, setSearchInsights] = useState<{text: string, urls: string[]} | null>(null);
    const [mapInsights, setMapInsights] = useState<{text: string, urls: string[]} | null>(null);
    const [showInsights, setShowInsights] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [segmentsData, reportsData] = await Promise.all([
                api.getSegments(),
                api.getReports()
            ]);
            setSegments(segmentsData);
            setReports(reportsData);
            
            if (activeTab === 'segments' && segmentsData.length > 0 && !selectedItem) {
                setSelectedItem(segmentsData[0]);
            } else if (activeTab === 'reports' && reportsData.length > 0 && !selectedItem) {
                setSelectedItem(reportsData[0]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleItemClick = (item: RiverSegment | WaterQualityReport) => {
        setSelectedItem(item);
        setShowPopup(true);
        setShowInsights(false);
        setSearchInsights(null);
        setMapInsights(null);
        setZoom(12);
        setTimeout(() => setZoom(16), 100);
    };

    const handleFetchInsights = async () => {
        if (!selectedItem) return;
        setInsightsLoading(true);
        setShowInsights(true);
        
        const locationName = isSegment(selectedItem) ? selectedItem.name : selectedItem.location;
        const lat = isSegment(selectedItem) ? selectedItem.coordinates.lat : (selectedItem.lat || 25.3176);
        const lng = isSegment(selectedItem) ? selectedItem.coordinates.lng : (selectedItem.lng || 82.9739);
        
        try {
            const [searchRes, mapRes] = await Promise.all([
                geminiService.getSearchInsights(locationName, language),
                geminiService.getMapInsights(locationName, lat, lng, language)
            ]);
            setSearchInsights({
                text: searchRes.text || "No insights available.",
                urls: searchRes.urls || []
            });
            setMapInsights({
                text: mapRes.text || "No map insights available.",
                urls: mapRes.urls || []
            });
        } catch (error) {
            console.error(error);
        } finally {
            setInsightsLoading(false);
        }
    };

    const isSegment = (item: any): item is RiverSegment => {
        return 'paramDo' in item;
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${embedded ? 'h-[700px] -mx-8 -mb-8 rounded-b-[2.5rem] overflow-hidden' : 'h-[calc(100vh-140px)] pt-4'} flex flex-col gap-6`}
        >
            {!embedded && <DisclaimerBanner />}
            <div className={`flex items-center justify-between bg-slate-900 text-white px-6 py-3 shadow-lg border border-slate-800 ${embedded ? 'rounded-none border-x-0 border-t-0' : 'rounded-2xl'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                        <span className="text-xs font-mono font-bold tracking-widest text-emerald-400">SYSTEM ONLINE</span>
                    </div>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                        <Radio size={14} className="animate-pulse" />
                        <span>{language === 'en' ? 'LIVE SAT-LINK ACTIVE' : 'लाइव सैट-लिंक सक्रिय'}</span>
                    </div>
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                    <Activity size={14} />
                    <span>{language === 'en' ? 'UPTIME: 99.9%' : 'अपटाइम: 99.9%'}</span>
                </div>
            </div>

            <div className={`flex flex-col md:flex-row gap-6 flex-1 min-h-0 ${embedded ? 'p-6' : ''}`}>
            {/* Sidebar List */}
            <div className="w-full md:w-96 flex flex-col gap-4">
                <div className="bg-slate-900 p-5 rounded-[2rem] shadow-2xl border border-slate-800 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white font-display text-lg flex items-center gap-2">
                            <Crosshair size={18} className="text-blue-500" />
                            {language === 'en' ? 'Telemetry Data' : 'टेलीमेट्री डेटा'}
                        </h3>
                        <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                    
                    <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <button 
                            onClick={() => setActiveTab('segments')}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'segments' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {language === 'en' ? 'Sensors' : 'सेंसर'}
                        </button>
                        <button 
                            onClick={() => setActiveTab('reports')}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {language === 'en' ? 'Reports' : 'रिपोर्ट्स'}
                        </button>
                    </div>
                </div>

                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 pb-4"
                >
                    {loading ? (
                        <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-slate-400" /></div>
                    ) : (
                        activeTab === 'segments' ? (
                            segments.map(seg => (
                                <motion.div 
                                    variants={itemAnim}
                                    key={seg.id}
                                    onClick={() => handleItemClick(seg)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                                        selectedItem?.id === seg.id 
                                        ? 'bg-slate-800 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02]' 
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-600 text-slate-300'
                                    }`}
                                >
                                    {selectedItem?.id === seg.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className={`font-bold text-sm font-display tracking-wide ${selectedItem?.id === seg.id ? 'text-white' : 'text-slate-200'}`}>{seg.name} <MockPill /></h4>
                                        <div className={`p-1.5 rounded-lg ${seg.status === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {seg.status === 'Critical' ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                                            <span className="text-slate-500 text-[9px] block mb-1">DO LEVEL</span>
                                            <span className={selectedItem?.id === seg.id ? 'text-blue-400' : 'text-slate-300'}>{seg.paramDo} mg/L</span>
                                        </div>
                                        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                                            <span className="text-slate-500 text-[9px] block mb-1">LAST SYNC</span>
                                            <span className={selectedItem?.id === seg.id ? 'text-blue-400' : 'text-slate-300'}>{seg.lastUpdate}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            reports.map(report => (
                                <motion.div 
                                    variants={itemAnim}
                                    key={report.id}
                                    onClick={() => handleItemClick(report)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                                        selectedItem?.id === report.id 
                                        ? 'bg-slate-800 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02]' 
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-600 text-slate-300'
                                    }`}
                                >
                                    {selectedItem?.id === report.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className={`font-bold text-sm font-display tracking-wide ${selectedItem?.id === report.id ? 'text-white' : 'text-slate-200'}`}>{report.location}</h4>
                                        <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            report.status === 'Safe' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                            report.status === 'Unsafe' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}>
                                            {report.status}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                                            <span className="text-slate-500 text-[9px] block mb-1">SOURCE</span>
                                            <span className="flex items-center gap-1 text-slate-300"><MapPin size={10} /> User</span>
                                        </div>
                                        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                                            <span className="text-slate-500 text-[9px] block mb-1">DATE</span>
                                            <span className="text-slate-300">{new Date(report.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )
                    )}
                </motion.div>
            </div>

            {/* Map Visualization Area */}
            <div className="flex-1 bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden relative flex flex-col transition-colors group/map">
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-[2.5rem]">
                    <motion.div 
                        animate={{ y: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="w-full h-32 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent border-b border-blue-500/30"
                    />
                </div>

                {/* Simulated Map View (Google Maps Embed) */}
                <AnimatePresence mode="wait">
                {selectedItem ? (
                    <motion.div 
                        key={selectedItem.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 relative bg-slate-950"
                    >
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            style={{ border: 0, opacity: 0.7, filter: 'invert(90%) hue-rotate(180deg) contrast(1.2) sepia(20%)' }}
                            src={`https://maps.google.com/maps?q=${isSegment(selectedItem) ? selectedItem.coordinates.lat : (selectedItem.lat || 25.3176)},${isSegment(selectedItem) ? selectedItem.coordinates.lng : (selectedItem.lng || 82.9739)}&z=${zoom}&output=embed`}
                            allowFullScreen
                            className="w-full h-full mix-blend-screen"
                        ></iframe>
                        
                        {/* Overlay Controls */}
                        <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-slate-700/50 flex flex-col gap-2 z-20">
                            <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"><Layers size={20} /></button>
                            <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"><Crosshair size={20} /></button>
                        </div>

                        {/* Popup Overlay */}
                        <AnimatePresence>
                            {showPopup && (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    className="absolute inset-0 flex items-center justify-center p-6 z-30 pointer-events-none"
                                >
                                    <div className={`bg-slate-900/95 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700 w-full pointer-events-auto relative overflow-y-auto no-scrollbar max-h-[90vh] transition-all duration-500 ${showInsights ? 'max-w-4xl' : 'max-w-md'}`}>
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                                        <button 
                                            onClick={() => setShowPopup(false)}
                                            className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors z-10"
                                        >
                                            <RefreshCw size={20} className="rotate-45" />
                                        </button>

                                        <div className={`flex flex-col ${showInsights ? 'md:flex-row gap-8' : ''}`}>
                                            {/* Left Column: Standard Data */}
                                            <div className={showInsights ? 'w-full md:w-1/3' : 'w-full'}>
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className={`p-4 rounded-2xl border ${selectedItem.status === 'Critical' || selectedItem.status === 'Unsafe' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                                                        {selectedItem.status === 'Critical' || selectedItem.status === 'Unsafe' ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
                                                    </div>
                                                    <div>
                                                        <h2 className="font-bold text-white text-2xl font-display tracking-wide">{isSegment(selectedItem) ? selectedItem.name : selectedItem.location}</h2>
                                                        <p className="text-xs font-mono text-slate-400 mt-1">{isSegment(selectedItem) ? (language === 'en' ? 'SEGMENT_ID:' : 'खंड आईडी:') : (language === 'en' ? 'REPORT_ID:' : 'रिपोर्ट आईडी:')} <span className="text-blue-400">{selectedItem.id}</span></p>
                                                    </div>
                                                </div>

                                                {isSegment(selectedItem) ? (
                                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                                            <div className="text-[10px] text-slate-500 font-mono mb-2 flex items-center gap-2"><Zap size={12} className="text-amber-500"/> {language === 'en' ? 'PH_LEVEL' : 'पीएच स्तर'}</div>
                                                            <div className="font-bold text-white text-2xl font-mono">{selectedItem.paramPh}</div>
                                                        </div>
                                                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                                            <div className="text-[10px] text-slate-500 font-mono mb-2 flex items-center gap-2"><Activity size={12} className="text-blue-500"/> {language === 'en' ? 'DISSOLVED_O2' : 'घुलित O2'}</div>
                                                            <div className="font-bold text-white text-2xl font-mono">{selectedItem.paramDo} <span className="text-sm text-slate-500">mg/L</span></div>
                                                        </div>
                                                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                                            <div className="text-[10px] text-slate-500 font-mono mb-2 flex items-center gap-2"><Layers size={12} className="text-emerald-500"/> {language === 'en' ? 'TURBIDITY' : 'मैलापन'}</div>
                                                            <div className="font-bold text-white text-2xl font-mono">12 <span className="text-sm text-slate-500">NTU</span></div>
                                                        </div>
                                                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                                            <div className="text-[10px] text-slate-500 font-mono mb-2 flex items-center gap-2"><Radio size={12} className="text-purple-500"/> {language === 'en' ? 'TEMP' : 'तापमान'}</div>
                                                            <div className="font-bold text-white text-2xl font-mono">24.5 <span className="text-sm text-slate-500">°C</span></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4 mb-8">
                                                        <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                                            <div className="text-[10px] text-slate-500 font-mono mb-2">{language === 'en' ? 'DESCRIPTION_LOG' : 'विवरण लॉग'}</div>
                                                            <p className="text-sm text-slate-300 leading-relaxed">{selectedItem.description}</p>
                                                        </div>
                                                        {selectedItem.imageUrl && (
                                                            <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-700 relative group">
                                                                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay z-10"></div>
                                                                <img src={selectedItem.imageUrl} alt="Report" className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!showInsights && (
                                                    <button 
                                                        onClick={handleFetchInsights}
                                                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] mb-6"
                                                    >
                                                        <Sparkles size={18} />
                                                        {language === 'en' ? 'Run AI Analysis' : 'एआई विश्लेषण चलाएं'}
                                                    </button>
                                                )}

                                                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-5 border-t border-slate-800">
                                                    <span>{language === 'en' ? 'LAST_SYNC:' : 'अंतिम सिंक:'} <span className="text-slate-300">{isSegment(selectedItem) ? selectedItem.lastUpdate : new Date(selectedItem.createdAt).toLocaleDateString()}</span></span>
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isSegment(selectedItem) ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                                        {isSegment(selectedItem) ? (language === 'en' ? 'LIVE SENSOR' : 'लाइव सेंसर') : (language === 'en' ? 'USER REPORT' : 'उपयोगकर्ता रिपोर्ट')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: AI Insights */}
                                            {showInsights && (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="w-full md:w-2/3 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles className="text-purple-400" size={20} />
                                                        <h3 className="text-lg font-bold text-white font-display tracking-wide">
                                                            {language === 'en' ? 'AI Contextual Intelligence' : 'एआई प्रासंगिक बुद्धिमत्ता'}
                                                        </h3>
                                                    </div>

                                                    {insightsLoading ? (
                                                        <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                                                            <RefreshCw className="animate-spin mb-4 text-purple-500" size={32} />
                                                            <p className="font-mono text-xs tracking-widest uppercase animate-pulse">
                                                                {language === 'en' ? 'Gathering Grounding Data...' : 'ग्राउंडिंग डेटा एकत्र किया जा रहा है...'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                            {/* Search Grounding */}
                                                            <div className="bg-slate-950/50 rounded-2xl border border-slate-800/80 p-5 flex flex-col">
                                                                <div className="flex items-center gap-2 mb-4 text-blue-400">
                                                                    <Globe size={16} />
                                                                    <h4 className="font-bold text-sm uppercase tracking-wider">{language === 'en' ? 'Recent News & Alerts' : 'हाल की खबरें और अलर्ट'}</h4>
                                                                </div>
                                                                <div className="text-sm text-slate-300 prose prose-invert prose-sm max-w-none flex-1">
                                                                    <Markdown>{searchInsights?.text || ''}</Markdown>
                                                                </div>
                                                                {searchInsights?.urls && searchInsights.urls.length > 0 && (
                                                                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                                                                        <p className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-wider">Sources</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {searchInsights.urls.map((url, idx) => (
                                                                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-blue-400 px-2 py-1 rounded border border-slate-800 transition-colors truncate max-w-[200px]">
                                                                                    <ExternalLink size={10} />
                                                                                    {new URL(url).hostname.replace('www.', '')}
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Maps Grounding */}
                                                            <div className="bg-slate-950/50 rounded-2xl border border-slate-800/80 p-5 flex flex-col">
                                                                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                                                                    <Building2 size={16} />
                                                                    <h4 className="font-bold text-sm uppercase tracking-wider">{language === 'en' ? 'Nearby Facilities' : 'आसपास की सुविधाएं'}</h4>
                                                                </div>
                                                                <div className="text-sm text-slate-300 prose prose-invert prose-sm max-w-none flex-1">
                                                                    <Markdown>{mapInsights?.text || ''}</Markdown>
                                                                </div>
                                                                {mapInsights?.urls && mapInsights.urls.length > 0 && (
                                                                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                                                                        <p className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-wider">Map Links</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {mapInsights.urls.map((url, idx) => (
                                                                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-emerald-400 px-2 py-1 rounded border border-slate-800 transition-colors truncate max-w-[200px]">
                                                                                    <MapPin size={10} />
                                                                                    View on Map
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom Detail Bar */}
                        {!showPopup && (
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute bottom-8 left-8 right-8 bg-slate-900/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4 z-20"
                            >
                                <div>
                                    <h2 className="font-bold text-white text-lg font-display tracking-wide">{isSegment(selectedItem) ? selectedItem.name : selectedItem.location}</h2>
                                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                                        <Crosshair size={14} className="text-blue-500" />
                                        <span>{language === 'en' ? 'LAT:' : 'अक्षांश:'} <span className="text-slate-300">{isSegment(selectedItem) ? selectedItem.coordinates.lat : (selectedItem.lat || 'N/A')}</span></span>
                                        <span>{language === 'en' ? 'LNG:' : 'देशांतर:'} <span className="text-slate-300">{isSegment(selectedItem) ? selectedItem.coordinates.lng : (selectedItem.lng || 'N/A')}</span></span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowPopup(true)}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                >
                                    {language === 'en' ? 'Expand Data' : 'डेटा विस्तार करें'}
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-950 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                        <Crosshair size={64} className="mb-6 text-slate-800 animate-pulse" />
                        <p className="font-mono text-sm tracking-widest uppercase">{language === 'en' ? 'Awaiting Target Selection' : 'लक्ष्य चयन की प्रतीक्षा है'}</p>
                    </div>
                )}
                </AnimatePresence>
            </div>
            </div>
        </motion.div>
    );
};