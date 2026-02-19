import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle, Volume2, Loader2, Play, Search, X } from 'lucide-react';
import { analyzeWaterImage, generateSpeech } from '../services/geminiService';
import { api } from '../services/api';
import { WaterQualityReport } from '../types';

export const AnalysisModule = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaterQualityReport | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
        if (audioContextRef.current) audioContextRef.current.close();
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
        const base64Data = image.split(',')[1];
        const analysisResult = await analyzeWaterImage(base64Data);
        // Simulate submitting to backend
        const submittedReport = await api.submitReport({
            ...analysisResult,
            locationName: "New Sample Location",
            coordinates: { lat: 25.942, lng: 83.554 }
        });
        setResult(submittedReport);
    } catch (error) {
        console.error("Analysis error", error);
        alert("Failed to analyze image.");
    } finally {
        setLoading(false);
    }
  };

  const playAudioReport = async () => {
      if (!result) return;
      if (isPlaying) return;

      setIsPlaying(true);
      try {
          const textToSpeak = `Analysis Report. Overall Score: ${result.overallScore}. Status: ${result.algaeLevel} Algae Level. Recommendation: ${result.recommendation}`;
          const base64Audio = await generateSpeech(textToSpeak);
          
          if (!base64Audio) throw new Error("No audio generated");

          const binaryString = atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }
          
          // Decode raw PCM (Int16) data from Gemini TTS
          const dataInt16 = new Int16Array(bytes.buffer);
          const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < dataInt16.length; i++) {
              // Convert Int16 to Float32 [-1.0, 1.0]
              channelData[i] = dataInt16[i] / 32768.0;
          }
          
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.onended = () => setIsPlaying(false);
          source.start(0);

      } catch (e) {
          console.error(e);
          setIsPlaying(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Camera size={24} /></div>
            AI Sample Analysis
          </h2>
          <p className="text-slate-500 mt-2 ml-12">Upload a water surface image for instant eutrophication detection.</p>
        </div>

        <div className="p-8">
          {!image ? (
            <label className="group flex flex-col items-center justify-center w-full h-72 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform text-blue-600">
                    <Upload className="w-8 h-8" />
                </div>
                <p className="mb-2 text-sm text-slate-600 font-medium">Click to upload photo</p>
                <p className="text-xs text-slate-400">High resolution recommended</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
                <img src={image} alt="Water Sample" className="w-full h-64 object-contain opacity-90" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {!result && (
                <button
                  onClick={analyze}
                  disabled={loading}
                  className="w-full py-4 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 btn-press"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" /> Processing Analysis...
                    </>
                  ) : (
                    <>
                      <CheckCircle /> Run Diagnostics
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {result && (
            <div className="mt-8 animate-slide-up">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Score</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className={`text-5xl font-bold ${result.overallScore < 50 ? 'text-red-600' : result.overallScore < 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                    {result.overallScore}
                                </h3>
                                <span className="text-slate-400 text-lg font-medium">/100</span>
                            </div>
                        </div>
                        <button 
                            onClick={playAudioReport}
                            disabled={isPlaying}
                            className={`p-4 rounded-full shadow-sm ${isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-white text-blue-900 hover:bg-blue-50'} transition-all`}
                        >
                            {isPlaying ? <Loader2 className="animate-spin" size={24} /> : <Volume2 size={24} />}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <MetricCard label="Algae Level" value={result.algaeLevel} />
                        <MetricCard label="Foam" value={result.foamDetected ? 'Detected' : 'None'} />
                        <MetricCard label="Turbidity" value={result.turbidity} />
                        <MetricCard label="Visual Color" value={result.color || 'Unspecified'} />
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                                <Search size={16} className="text-blue-500"/> Observation
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{result.details}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                                <AlertCircle size={16}/> Protocol Recommendation
                            </h4>
                            <p className="text-blue-800 text-sm leading-relaxed">{result.recommendation}</p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-white p-3 rounded-xl border border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{label}</p>
        <p className="font-semibold text-slate-800 text-sm">{value}</p>
    </div>
);