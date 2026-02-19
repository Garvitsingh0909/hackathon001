import React, { useEffect, useState } from 'react';
import { Map, RefreshCw, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { RiverSegment } from '../types';

export const AdminMap = () => {
    const [segments, setSegments] = useState<RiverSegment[]>([]);
    const [selectedSegment, setSelectedSegment] = useState<RiverSegment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSegments = async () => {
            setLoading(true);
            const data = await api.getSegments();
            setSegments(data);
            if (data.length > 0) setSelectedSegment(data[0]);
            setLoading(false);
        };
        fetchSegments();
    }, []);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-slide-up">
            
            {/* Sidebar List */}
            <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900">River Segments</h3>
                        <p className="text-xs text-slate-500">{segments.length} Active Sensors</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-50 rounded-full text-slate-500">
                        <RefreshCw size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
                    {loading ? (
                        <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-slate-400" /></div>
                    ) : (
                        segments.map(seg => (
                            <div 
                                key={seg.id}
                                onClick={() => setSelectedSegment(seg)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSegment?.id === seg.id ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-white border-slate-100 hover:border-blue-200 text-slate-800'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-sm">{seg.name}</h4>
                                    {seg.status === 'Critical' ? <AlertTriangle size={14} className="text-red-500" /> : <ShieldCheck size={14} className="text-emerald-500" />}
                                </div>
                                <div className="flex justify-between items-end text-xs opacity-80">
                                    <span>DO: {seg.paramDo} mg/L</span>
                                    <span>{seg.lastUpdate}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Map Visualization Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative flex flex-col">
                
                {/* Simulated Map View (Google Maps Embed) */}
                {selectedSegment ? (
                    <div className="flex-1 relative bg-slate-100">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            style={{ border: 0, opacity: 0.9 }}
                            src={`https://maps.google.com/maps?q=${selectedSegment.coordinates.lat},${selectedSegment.coordinates.lng}&z=15&output=embed`}
                            allowFullScreen
                        ></iframe>
                        
                        {/* Overlay Controls */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-2 shadow-sm border border-slate-200 flex flex-col gap-2">
                            <button className="p-2 hover:bg-slate-100 rounded text-slate-600"><Layers size={20} /></button>
                            <button className="p-2 hover:bg-slate-100 rounded text-slate-600"><Map size={20} /></button>
                        </div>

                        {/* Detail Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-slate-900 text-lg">{selectedSegment.name}</h2>
                                <p className="text-sm text-slate-500">Lat: {selectedSegment.coordinates.lat}, Lng: {selectedSegment.coordinates.lng}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 uppercase">pH Level</div>
                                    <div className="font-bold text-slate-800">{selectedSegment.paramPh}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 uppercase">Dissolved O2</div>
                                    <div className="font-bold text-slate-800">{selectedSegment.paramDo}</div>
                                </div>
                                <div className={`px-4 py-1 rounded-lg flex items-center font-bold text-sm ${selectedSegment.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {selectedSegment.status}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Select a segment to view live data
                    </div>
                )}
            </div>
        </div>
    );
};