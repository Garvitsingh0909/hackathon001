import React, { useState, useEffect } from 'react';
import { Map, Search, Newspaper, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { searchWaterNews, findNearbyStations } from '../services/geminiService';
import { motion } from 'motion/react';

export const WaterIntel = () => {
    const [activeSection, setActiveSection] = useState<'news' | 'stations'>('news');
    const [news, setNews] = useState<{text: string, sources: any[]} | null>(null);
    const [stations, setStations] = useState<{text: string, chunks: any[]} | null>(null);
    const [loading, setLoading] = useState(false);

    // Mock Location for Tamsa River Basin (Maunath Bhanjan approx)
    const MOCK_LAT = 25.9427;
    const MOCK_LNG = 83.5539;

    const fetchNews = async () => {
        setLoading(true);
        try {
            const result = await searchWaterNews("Tamsa River pollution and water quality Uttar Pradesh");
            setNews({
                text: result.text || "No news found.",
                sources: result.groundingMetadata?.groundingChunks || []
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchStations = async () => {
        setLoading(true);
        try {
            const result = await findNearbyStations(MOCK_LAT, MOCK_LNG);
            setStations({
                text: result.text || "No stations found.",
                chunks: result.chunks || []
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeSection === 'news' && !news) fetchNews();
        if (activeSection === 'stations' && !stations) fetchStations();
    }, [activeSection]);

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
            <div className="flex items-center justify-center gap-4 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto mb-8">
                <button
                    onClick={() => setActiveSection('news')}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeSection === 'news' ? 'bg-[#0B1F3B] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                    <span className="flex items-center gap-2"><Newspaper size={18} /> Latest News</span>
                </button>
                <button
                    onClick={() => setActiveSection('stations')}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeSection === 'stations' ? 'bg-[#0B1F3B] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                    <span className="flex items-center gap-2"><MapPin size={18} /> Nearby Stations</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin mb-4 text-[#1CA7A6]" size={48} />
                    <p className="font-medium animate-pulse">Gathering intelligence from Tamsa Basin...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 min-h-[500px]">
                    {activeSection === 'news' && news && (
                        <motion.div variants={container} initial="hidden" animate="show">
                            <motion.div variants={item} className="mb-8 border-b border-slate-100 pb-6">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3 font-display">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Search size={24} /></div>
                                    Grounded Search
                                </h2>
                                <p className="text-slate-500 ml-14">Real-time environmental updates for Tamsa River</p>
                            </motion.div>
                            
                            <motion.div variants={item} className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed">
                                <p className="whitespace-pre-line">{news.text}</p>
                            </motion.div>
                            
                            {news.sources.length > 0 && (
                                <motion.div variants={item} className="mt-12 pt-8 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="w-4 h-[1px] bg-slate-300"></div> Verified Sources
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
                                                    className="flex flex-col justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-200 bg-white hover:shadow-lg transition-all duration-300 group h-full"
                                                >
                                                    <div>
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                <Newspaper size={20} />
                                                            </div>
                                                            <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                                                        </div>
                                                        <h4 className="font-bold text-slate-900 text-lg leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">{source.web.title}</h4>
                                                        <p className="text-xs text-slate-400 font-mono truncate">{new URL(source.web.uri).hostname}</p>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
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
                            <motion.div variants={item} className="mb-8 border-b border-slate-100 pb-6">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3 font-display">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Map className="text-emerald-500" size={24} /></div>
                                    Monitoring Points
                                </h2>
                                <p className="text-slate-500 ml-14">Official water quality stations and landmarks</p>
                            </motion.div>

                            <motion.p variants={item} className="text-slate-600 mb-10 whitespace-pre-line text-lg leading-relaxed">{stations.text}</motion.p>
                            
                            {/* Render Google Maps Grounding Sources if available in chunks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stations.chunks?.map((chunk, idx) => {
                                    if (chunk.web?.uri && chunk.web?.title) {
                                       return (
                                        <motion.div variants={item} key={idx} className="border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all bg-white group">
                                            <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-700 transition-colors">{chunk.web.title}</h4>
                                            <a href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-bold flex items-center gap-2 mt-4 bg-blue-50 w-fit px-3 py-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                View Source <ArrowRight size={14} />
                                            </a>
                                        </motion.div>
                                       )
                                    }
                                    if (chunk.maps?.uri && chunk.maps?.title) {
                                        return (
                                         <motion.div variants={item} key={idx} className="border border-blue-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all bg-blue-50/30 group">
                                             <div className="flex items-start justify-between mb-2">
                                                 <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-800 transition-colors">{chunk.maps.title}</h4>
                                                 <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm">
                                                    <MapPin size={18} />
                                                 </div>
                                             </div>
                                             <a href={chunk.maps.uri} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-bold flex items-center gap-2 mt-4 bg-white w-fit px-3 py-1.5 rounded-lg shadow-sm group-hover:shadow transition-all">
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
                </div>
            )}
        </motion.div>
    );
};

// Helper for ArrowRight in Intel
const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);