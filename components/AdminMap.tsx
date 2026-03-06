import React, { useEffect, useState } from 'react';
import { Map, RefreshCw, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { RiverSegment } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const AdminMap = () => {
    const [segments, setSegments] = useState<RiverSegment[]>([]);
    const [selectedSegment, setSelectedSegment] = useState<RiverSegment | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSegments = async () => {
        setLoading(true);
        try {
            const data = await api.getSegments();
            setSegments(data);
            if (data.length > 0 && !selectedSegment) setSelectedSegment(data[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSegments();
    }, []);

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
            className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 pt-4"
        >
            
            {/* Sidebar List */}
            <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 font-display text-lg">River Segments</h3>
                        <p className="text-xs text-slate-500 font-medium">{segments.length} Active Sensors</p>
                    </div>
                    <button onClick={fetchSegments} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors">
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
                                onClick={() => setSelectedSegment(seg)}
                                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group ${
                                    selectedSegment?.id === seg.id 
                                    ? 'bg-[#0B1F3B] border-[#0B1F3B] text-white shadow-lg shadow-blue-900/20 scale-[1.02]' 
                                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md text-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className={`font-bold text-sm ${selectedSegment?.id === seg.id ? 'text-white' : 'text-slate-900'}`}>{seg.name}</h4>
                                    {seg.status === 'Critical' ? <AlertTriangle size={16} className="text-red-500" /> : <ShieldCheck size={16} className="text-emerald-500" />}
                                </div>
                                <div className={`flex justify-between items-end text-xs font-medium ${selectedSegment?.id === seg.id ? 'text-blue-200' : 'text-slate-400'}`}>
                                    <span className="bg-white/10 px-2 py-1 rounded-lg">DO: {seg.paramDo} mg/L</span>
                                    <span>{seg.lastUpdate}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

            {/* Map Visualization Area */}
            <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative flex flex-col">
                
                {/* Simulated Map View (Google Maps Embed) */}
                <AnimatePresence mode="wait">
                {selectedSegment ? (
                    <motion.div 
                        key={selectedSegment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 relative bg-slate-100"
                    >
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            style={{ border: 0, opacity: 0.9, filter: 'grayscale(20%) contrast(1.1)' }}
                            src={`https://maps.google.com/maps?q=${selectedSegment.coordinates.lat},${selectedSegment.coordinates.lng}&z=15&output=embed`}
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                        
                        {/* Overlay Controls */}
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/50 flex flex-col gap-2">
                            <button className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"><Layers size={20} /></button>
                            <button className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"><Map size={20} /></button>
                        </div>

                        {/* Detail Overlay */}
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 flex flex-col md:flex-row justify-between items-center gap-4"
                        >
                            <div>
                                <h2 className="font-bold text-slate-900 text-xl font-display">{selectedSegment.name}</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                    <Map size={14} />
                                    <span>Lat: {selectedSegment.coordinates.lat}, Lng: {selectedSegment.coordinates.lng}</span>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">pH Level</div>
                                    <div className="font-bold text-slate-900 text-xl font-display">{selectedSegment.paramPh}</div>
                                </div>
                                <div className="w-[1px] h-10 bg-slate-200"></div>
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Dissolved O2</div>
                                    <div className="font-bold text-slate-900 text-xl font-display">{selectedSegment.paramDo}</div>
                                </div>
                                <div className={`px-5 py-2 rounded-xl flex items-center font-bold text-sm shadow-sm ${selectedSegment.status === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                    {selectedSegment.status}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                        <Map size={48} className="mb-4 text-slate-300" />
                        <p className="font-medium">Select a segment to view live data</p>
                    </div>
                )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};