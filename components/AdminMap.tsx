import React, { useEffect, useState } from 'react';
import { Map, RefreshCw, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { RiverSegment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { MockPill } from './ui/MockPill';

export const AdminMap = () => {
    const [segments, setSegments] = useState<RiverSegment[]>([]);
    const [selectedSegment, setSelectedSegment] = useState<RiverSegment | null>(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(12);
    const [showPopup, setShowPopup] = useState(false);

    const fetchSegments = async () => {
        setLoading(true);
        try {
            const data = await api.getSegments();
            setSegments(data);
            if (data.length > 0 && !selectedSegment) {
                setSelectedSegment(data[0]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSegments();
    }, []);

    const handleSegmentClick = (seg: RiverSegment) => {
        setSelectedSegment(seg);
        setShowPopup(true);
        // Smoothly "zoom" by updating state
        setZoom(12);
        setTimeout(() => setZoom(16), 100);
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

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[calc(100vh-140px)] flex flex-col gap-6 pt-4"
        >
            <DisclaimerBanner />
            <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
            {/* Sidebar List */}
            <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="bg-gov-card dark:bg-slate-900 p-5 rounded-[2rem] shadow-subtle border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white font-display text-lg">River Segments</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{segments.length} Active Sensors</p>
                    </div>
                    <button onClick={fetchSegments} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
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
                        segments.map(seg => (
                            <motion.div 
                                variants={item}
                                key={seg.id}
                                onClick={() => handleSegmentClick(seg)}
                                className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all duration-300 group ${
                                    selectedSegment?.id === seg.id 
                                    ? 'bg-gov-navy dark:bg-blue-600 border-gov-navy dark:border-blue-500 text-white shadow-subtle-hover scale-[1.02]' 
                                    : 'bg-gov-card dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-subtle text-slate-800 dark:text-slate-200'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className={`font-bold text-sm ${selectedSegment?.id === seg.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{seg.name} <MockPill /></h4>
                                    {seg.status === 'Critical' ? <AlertTriangle size={16} className="text-red-500" /> : <ShieldCheck size={16} className="text-emerald-500" />}
                                </div>
                                <div className={`flex justify-between items-end text-xs font-medium ${selectedSegment?.id === seg.id ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                    <span className="bg-white/10 dark:bg-black/20 px-2 py-1 rounded-lg">DO: {seg.paramDo} mg/L</span>
                                    <span>{seg.lastUpdate}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

            {/* Map Visualization Area */}
            <div className="flex-1 bg-gov-card dark:bg-slate-900 rounded-[2rem] shadow-subtle border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col transition-colors">
                
                {/* Simulated Map View (Google Maps Embed) */}
                <AnimatePresence mode="wait">
                {selectedSegment ? (
                    <motion.div 
                        key={selectedSegment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 relative bg-slate-100 dark:bg-slate-800"
                    >
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            style={{ border: 0, opacity: 0.9, filter: 'grayscale(20%) contrast(1.1)' }}
                            src={`https://maps.google.com/maps?q=${selectedSegment.coordinates.lat},${selectedSegment.coordinates.lng}&z=${zoom}&output=embed`}
                            allowFullScreen
                            className="w-full h-full dark:opacity-80"
                        ></iframe>
                        
                        {/* Overlay Controls */}
                        <div className="absolute top-6 right-6 bg-gov-card/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[1.5rem] p-2 shadow-subtle border border-white/50 dark:border-slate-700/50 flex flex-col gap-2 transition-colors">
                            <button onClick={() => console.log('Layers clicked')} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"><Layers size={20} /></button>
                            <button onClick={() => console.log('Map clicked')} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"><Map size={20} /></button>
                        </div>

                        {/* Popup Overlay */}
                        <AnimatePresence>
                            {showPopup && (
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                                    className="absolute inset-0 flex items-center justify-center p-6 z-20 pointer-events-none"
                                >
                                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 max-w-md w-full pointer-events-auto relative">
                                        <button 
                                            onClick={() => setShowPopup(false)}
                                            className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                                        >
                                            <RefreshCw size={20} className="rotate-45" />
                                        </button>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`p-4 rounded-2xl ${selectedSegment.status === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {selectedSegment.status === 'Critical' ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-slate-900 dark:text-white text-2xl font-display">{selectedSegment.name}</h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Segment ID: {selectedSegment.id}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-subtle">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">pH Level</div>
                                                <div className="font-bold text-slate-900 dark:text-white text-xl">{selectedSegment.paramPh}</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-subtle">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Dissolved O2</div>
                                                <div className="font-bold text-slate-900 dark:text-white text-xl">{selectedSegment.paramDo} mg/L</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-subtle">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Turbidity</div>
                                                <div className="font-bold text-slate-900 dark:text-white text-xl">12 NTU</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-subtle">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Temperature</div>
                                                <div className="font-bold text-slate-900 dark:text-white text-xl">24.5°C</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <span>Last updated: {selectedSegment.lastUpdate}</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                Live Sensor
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom Detail Bar (Optional, keeping it for quick info) */}
                        {!showPopup && (
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute bottom-8 left-8 right-8 bg-gov-card/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-subtle-hover border border-white/50 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors"
                            >
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white text-xl font-display">{selectedSegment.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        <Map size={14} />
                                        <span>Lat: {selectedSegment.coordinates.lat}, Lng: {selectedSegment.coordinates.lng}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowPopup(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    View Detailed Report
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                        <Map size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="font-medium">Select a segment to view live data</p>
                    </div>
                )}
                </AnimatePresence>
            </div>
            </div>
        </motion.div>
    );
};