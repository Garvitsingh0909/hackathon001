import React, { useState, useEffect } from 'react';
import { Map, Search, Newspaper, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { searchWaterNews, findNearbyStations } from '../services/geminiService';

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

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100 w-fit mx-auto mb-8">
                <button
                    onClick={() => setActiveSection('news')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'news' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <span className="flex items-center gap-2"><Newspaper size={16} /> Latest News</span>
                </button>
                <button
                    onClick={() => setActiveSection('stations')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'stations' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <span className="flex items-center gap-2"><MapPin size={16} /> Nearby Stations</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p>Gathering intelligence...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-[400px]">
                    {activeSection === 'news' && news && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Search className="text-blue-500" /> Grounded Search: Tamsa River
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-600">
                                <p className="whitespace-pre-line">{news.text}</p>
                            </div>
                            
                            {news.sources.length > 0 && (
                                <div className="mt-8 border-t border-slate-100 pt-6">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sources</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {news.sources.map((source, idx) => (
                                            source.web ? (
                                                <a key={idx} href={source.web.uri} target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                                                    <div className="bg-slate-100 group-hover:bg-white p-2 rounded text-slate-500">
                                                        <ExternalLink size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{source.web.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{source.web.uri}</p>
                                                    </div>
                                                </a>
                                            ) : null
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'stations' && stations && (
                         <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Map className="text-blue-500" /> Map Grounding: Monitoring Points
                            </h2>
                            <p className="text-slate-600 mb-6 whitespace-pre-line">{stations.text}</p>
                            
                            {/* Render Google Maps Grounding Sources if available in chunks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stations.chunks?.map((chunk, idx) => {
                                    if(chunk.web?.uri && chunk.web?.title) {
                                       return (
                                        <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <h4 className="font-bold text-slate-800">{chunk.web.title}</h4>
                                            <a href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-blue-600 text-sm flex items-center gap-1 mt-2">
                                                View on Maps <ArrowRight size={12} />
                                            </a>
                                        </div>
                                       )
                                    }
                                    return null;
                                })}
                            </div>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper for ArrowRight in Intel
const ArrowRight = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);