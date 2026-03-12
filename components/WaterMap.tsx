import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Volume2 } from 'lucide-react';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../services/api';
import { RiverSegment } from '../types';
import { playBrowserTTS } from '../lib/claude';

// Fix for default Leaflet icons
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface StateData {
    id: string;
    name: string;
    coordinates: [number, number];
    quality: string;
    details: string;
}

const INDIA_STATES: StateData[] = [
    { id: 'up', name: 'Uttar Pradesh', coordinates: [26.8467, 80.9462], quality: 'Moderate', details: 'High turbidity in Tamsa and Ganga basins. Industrial runoff remains a concern.' },
    { id: 'bh', name: 'Bihar', coordinates: [25.0961, 85.3131], quality: 'Critical', details: 'Arsenic contamination reported in groundwater across 18 districts. High flood risk.' },
    { id: 'mh', name: 'Maharashtra', coordinates: [19.7515, 75.7139], quality: 'Good', details: 'Improved treatment in urban centers. Drought conditions in Marathwada affect availability.' },
    { id: 'rj', name: 'Rajasthan', coordinates: [27.0238, 74.2179], quality: 'Warning', details: 'High fluoride levels in groundwater. Indira Gandhi Canal is the primary source.' },
    { id: 'wb', name: 'West Bengal', coordinates: [22.9868, 87.8550], quality: 'Critical', details: 'Severe arsenic issues in southern districts. Salinity intrusion in Sundarbans.' },
    { id: 'tn', name: 'Tamil Nadu', coordinates: [11.1271, 78.6569], quality: 'Good', details: 'Strong desalination initiatives. Cauvery water sharing remains a key governance issue.' },
    { id: 'ka', name: 'Karnataka', coordinates: [15.3173, 75.7139], quality: 'Moderate', details: 'Vrishabhavathi river pollution in Bengaluru. Good reservoir levels in the west.' },
    { id: 'gj', name: 'Gujarat', coordinates: [22.2587, 71.1924], quality: 'Good', details: 'Narmada canal network has improved access. Industrial zones monitored for chemical runoff.' },
    { id: 'mp', name: 'Madhya Pradesh', coordinates: [22.9734, 78.6569], quality: 'Moderate', details: 'Narmada river quality is stable. Chambal basin shows signs of agricultural runoff.' },
    { id: 'kl', name: 'Kerala', coordinates: [10.8505, 76.2711], quality: 'Good', details: 'High rainfall ensures availability. Bacterial contamination in open wells is a seasonal issue.' }
];

export const WaterMap = ({ language }: { language: 'en' | 'hi' }) => {
  const [segments, setSegments] = useState<RiverSegment[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const fetchSegments = async () => {
        const data = await api.getSegments();
        setSegments(data);
    };
    fetchSegments();
  }, []);

  const handleStateClick = (state: StateData) => {
    const text = `Water quality in ${state.name} is ${state.quality}. ${state.details}`;
    playBrowserTTS(
        text,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        language === 'hi' ? 'hi-IN' : 'en-IN'
    );
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto pt-6"
    >
      <DisclaimerBanner />
      <div className="bg-gov-card dark:bg-slate-900 rounded-[2rem] shadow-subtle dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors h-[600px] relative">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* State Markers */}
          {INDIA_STATES.map((state) => (
            <Marker 
                key={state.id} 
                position={state.coordinates}
                eventHandlers={{
                    click: () => handleStateClick(state),
                }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-gov-navy">{state.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            state.quality === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                            state.quality === 'Moderate' ? 'bg-blue-100 text-blue-700' :
                            state.quality === 'Warning' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                        }`}>{state.quality}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{state.details}</p>
                    <button 
                        onClick={() => handleStateClick(state)}
                        className="w-full py-2 bg-gov-navy text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                    >
                        <Volume2 size={14} /> Listen to Report
                    </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* River Segment Markers (Local) */}
          {segments.map((segment) => (
            <Marker key={segment.id} position={[segment.coordinates.lat, segment.coordinates.lng]}>
              <Popup>
                <div className="p-2">
                    <h3 className="font-bold text-lg">{segment.name}</h3>
                    <p className="text-sm">Status: {segment.status}</p>
                    <p className="text-sm">DO: {segment.paramDo} mg/L</p>
                    <p className="text-sm">pH: {segment.paramPh}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {isSpeaking && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-gov-navy text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                <div className="flex gap-1">
                    <div className="w-1 h-4 bg-gov-teal animate-[music-bar_1s_infinite_0.1s]"></div>
                    <div className="w-1 h-4 bg-gov-teal animate-[music-bar_1s_infinite_0.3s]"></div>
                    <div className="w-1 h-4 bg-gov-teal animate-[music-bar_1s_infinite_0.5s]"></div>
                </div>
                <span className="text-xs font-bold tracking-widest uppercase">AI Voice Active</span>
            </div>
        )}
      </div>
    </motion.div>
  );
};
