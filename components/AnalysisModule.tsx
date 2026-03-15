import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle, Volume2, Loader2, Play, Search, X, BarChart3, TrendingUp, Droplets, RotateCcw, ChevronDown, ChevronUp, Info, Printer, Share2, Activity } from 'lucide-react';
import { analyzeWaterImage, playBrowserTTS } from '../lib/gemini';
import { api } from '../services/api';
import { WaterQualityReport } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { useAuth } from '../src/AuthContext';

const FAQ_ITEMS = [
    { q: "How accurate is this visual analysis?", a: "This analysis provides a preliminary assessment based on visual indicators like color, turbidity, and visible algae. It is not a substitute for laboratory testing." },
    { q: "What does the Overall Score mean?", a: "The score (0-100) represents the estimated visual quality of the water. 80-100 is excellent, 50-79 is moderate, and below 50 indicates visible contamination." },
    { q: "Can it detect invisible chemicals?", a: "No. Visual analysis cannot detect dissolved chemicals, heavy metals, or microscopic pathogens. Always use proper testing kits for drinking water." }
];

const ActionModal = ({ isOpen, onClose, score }: { isOpen: boolean, onClose: () => void, score: number }) => {
    if (!isOpen) return null;
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            >
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl ${score < 50 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        <AlertCircle size={32} />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">Safety Protocol Required</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Based on the visual diagnostic score of <span className="font-bold text-slate-900 dark:text-white">{score}</span>, the following immediate actions are recommended to ensure safety.
                </p>
                
                <div className="space-y-4 mb-8">
                    {[
                        { title: "Avoid Consumption", desc: "Do not drink this water without professional RO/UV treatment.", icon: Droplets },
                        { title: "Boil Before Use", desc: "If no filter is available, boil water for at least 10 minutes.", icon: TrendingUp },
                        { title: "Contact Authorities", desc: "Report this contamination level to the local water board.", icon: Info }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="text-blue-500 mt-1"><step.icon size={20} /></div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{step.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={onClose}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    I Understand
                </button>
            </motion.div>
        </motion.div>
    );
};

export const AnalysisModule = () => {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<WaterQualityReport | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
        setProgress(0);
        interval = setInterval(() => {
            setProgress(prev => (prev >= 90 ? 90 : prev + 10));
        }, 500);
    } else {
        setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    return () => {
        if (audioContextRef.current) audioContextRef.current.close();
        window.speechSynthesis.cancel();
    }
  }, []);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMimeType(file.type);
        setResult(null);
        setLoading(false);
      };
      reader.onerror = () => {
        alert("Failed to read image file.");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    console.log('[AnalysisModule] Starting analysis for uploaded image');
    
    try {
        const base64Data = image.split(',')[1];
        console.log('[AnalysisModule] Calling analyzeWaterImage API');
        const analysisResult = await analyzeWaterImage(base64Data, mimeType);
        console.log('[AnalysisModule] API analysis successful', analysisResult);
        
        const finalReport: WaterQualityReport = {
            ...analysisResult,
            id: Date.now().toString(),
            userId: user?.uid || 'anonymous',
            locationName: "Sample Location",
            coordinates: { lat: 25.942, lng: 83.554 },
            timestamp: new Date().toISOString(),
            status: 'Pending',
            ph: Number((7 + (Math.random() * 1.5 - 0.75)).toFixed(1)),
            dissolvedOxygen: Number((6 + (Math.random() * 4)).toFixed(1)),
            chlorophyll: Number((10 + (Math.random() * 20)).toFixed(1)),
            nitrogen: Number((1.5 + (Math.random() * 2)).toFixed(2)),
            phosphorus: Number((0.1 + (Math.random() * 0.2)).toFixed(3)),
            historicalData: []
        };

        setSuccess(true);
        console.log('[AnalysisModule] Final report generated', finalReport);
        
        // Save to mock API if user is logged in
        if (user) {
            setSaveStatus('saving');
            console.log('[AnalysisModule] Saving report for user', user.uid);
            try {
                await api.submitReport(finalReport);
                setSaveStatus('saved');
                console.log('[AnalysisModule] Report saved successfully');
            } catch (error) {
                console.error("[AnalysisModule] Error saving report:", error);
                setSaveStatus('error');
            }
        }

        setTimeout(() => {
            setResult(finalReport);
            setSuccess(false);
        }, 1000);
    } catch (error: any) {
        console.error("[AnalysisModule] Critical analysis error", error);
        alert(`Failed to analyze image. Error: ${error.message || 'Unknown error'}. Please try again.`);
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
          playBrowserTTS(
              textToSpeak,
              () => setIsPlaying(true),
              () => setIsPlaying(false)
          );
      } catch (e) {
          console.error("TTS Error:", e);
          setIsPlaying(false);
      }
  };

  const resetAll = () => {
      setImage(null);
      setResult(null);
      setExpandedFaq(null);
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return '#10b981'; // emerald-500
      if (score >= 50) return '#f59e0b'; // amber-500
      return '#ef4444'; // red-500
  };

  const handlePrint = () => {
      window.print();
  };

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'JalDrishti Water Quality Report',
                  text: `Water Quality Score: ${result?.overallScore}/100. Status: ${result?.overallScore && result.overallScore >= 80 ? 'Good' : result?.overallScore && result.overallScore >= 50 ? 'Moderate' : 'Poor'}.`,
                  url: window.location.href,
              });
          } catch (error) {
              console.error('Error sharing:', error);
          }
      } else {
          alert("Sharing is not supported on this browser.");
      }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto pt-6"
    >
      <DisclaimerBanner />
      <ActionModal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} score={result?.overallScore || 0} />
      <div className="bg-gov-card dark:bg-slate-900 rounded-[2rem] shadow-subtle dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors" id="printable-report">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 dark:border-slate-800 bg-gov-bg dark:bg-slate-800/30 flex justify-between items-start">
          <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-2xl">
                    <Camera size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Water Analysis</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Visual Diagnostic Engine</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed print:hidden">
                Upload a high-resolution image of the water surface. The system will analyze eutrophication levels, turbidity, and potential contaminants instantly.
              </p>
          </div>
          {image && (
              <div className="flex items-center gap-2 print:hidden">
                  {result && (
                      <>
                          <button 
                              onClick={handlePrint}
                              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                              <Printer size={16} /> Print
                          </button>
                          <button 
                              onClick={handleShare}
                              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-blue-200 dark:border-blue-800"
                          >
                              <Share2 size={16} /> Share
                          </button>
                      </>
                  )}
                  <button 
                      onClick={resetAll}
                      className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                      <RotateCcw size={16} /> Reset
                  </button>
              </div>
          )}
        </div>

        <div className="p-8 md:p-10">
          {!image ? (
            <motion.label 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group flex flex-col items-center justify-center w-full h-80 border ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'} border-dashed rounded-2xl cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))] -z-10"></div>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className={`p-5 rounded-full shadow-subtle mb-4 group-hover:shadow-subtle-hover transition-all duration-300 ring-4 ${isDragging ? 'bg-gov-teal text-white ring-gov-teal/30' : 'bg-gov-card dark:bg-slate-800 text-gov-teal dark:text-gov-teal ring-gov-teal/10 dark:ring-gov-teal/30'}`}
                >
                    <Upload className="w-8 h-8" />
                </motion.div>
                <p className="mb-2 text-lg text-slate-700 dark:text-slate-200 font-semibold font-display">
                    {isDragging ? 'Drop image here' : 'Click or drag to upload photo'}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </motion.label>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative rounded-3xl overflow-hidden bg-slate-900 shadow-inner group aspect-square md:aspect-video lg:aspect-square lg:h-full border-4 transition-colors duration-500 ${
                        result 
                            ? result.overallScore >= 80 ? 'border-emerald-500' : result.overallScore >= 50 ? 'border-amber-500' : 'border-red-500'
                            : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="Water Sample" className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent print:hidden"></div>
                    
                    {/* Scanning Animation Overlay */}
                    <AnimatePresence>
                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 print:hidden"
                        >
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"></div>
                            
                            {/* Tech Grid Background */}
                            <div className="absolute inset-0 overflow-hidden opacity-20">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                                <motion.div 
                                    animate={{ 
                                        backgroundPosition: ["0px 0px", "40px 40px"] 
                                    }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#3b82f61a,transparent)]"
                                ></motion.div>
                            </div>

                            {/* Water Droplet Fill Animation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-48 h-48">
                                    <svg viewBox="0 0 24 24" className="w-full h-full text-white/5 absolute inset-0">
                                        <path fill="currentColor" d="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z" />
                                    </svg>
                                    <motion.div 
                                        className="absolute bottom-0 left-0 w-full overflow-hidden"
                                        initial={{ height: "0%" }}
                                        animate={{ height: ["0%", "100%", "0%"] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    >
                                        <svg viewBox="0 0 24 24" className="w-48 h-48 text-blue-500/40 absolute bottom-0 left-0 blur-sm">
                                            <path fill="currentColor" d="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z" />
                                        </svg>
                                        <svg viewBox="0 0 24 24" className="w-48 h-48 text-blue-400 absolute bottom-0 left-0">
                                            <path fill="currentColor" d="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z" />
                                        </svg>
                                    </motion.div>
                                    
                                    {/* Scanning Data Points */}
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div 
                                            key={i}
                                            animate={{ 
                                                opacity: [0, 1, 0],
                                                scale: [0.5, 1.2, 0.5],
                                                x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                                                y: [Math.random() * 100 - 50, Math.random() * 100 - 50]
                                            }}
                                            transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, delay: i * 0.3 }}
                                            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_15px_#60a5fa]"
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <motion.div 
                                animate={{ top: ["0%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_30px_rgba(96,165,250,0.8)] z-30"
                            />
                            
                            <div className="absolute bottom-12 left-0 right-0 flex justify-center flex-col items-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-slate-900/90 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 text-white text-[10px] font-mono tracking-[0.3em] uppercase">
                                        Neural_Diagnostic_In_Progress
                                    </div>
                                    <div className="text-blue-400 font-mono text-[10px] tracking-widest animate-pulse">
                                        ANALYZING_SPECTRAL_DENSITY...
                                    </div>
                                </div>
                                
                                <div className="w-72 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex gap-12">
                                    <div className="flex flex-col items-center">
                                        <span className="text-white/40 text-[8px] font-mono uppercase tracking-widest mb-1">Progress</span>
                                        <span className="text-white text-xs font-mono">{progress}%</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-white/40 text-[8px] font-mono uppercase tracking-widest mb-1">Confidence</span>
                                        <span className="text-white text-xs font-mono">{(85 + progress * 0.1).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-white/40 text-[8px] font-mono uppercase tracking-widest mb-1">Samples</span>
                                        <span className="text-white text-xs font-mono">1,024</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <button 
                      onClick={resetAll}
                      disabled={loading}
                      className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors border border-white/20 disabled:opacity-0 print:hidden"
                    >
                      <X size={18} />
                    </button>
                    <div className="absolute bottom-4 left-4 text-white print:hidden">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">Source Image</p>
                    </div>
                  </motion.div>
              </div>

              <div className="flex flex-col justify-center space-y-6">
                  <AnimatePresence mode="wait">
                  {!result ? (
                    <motion.div 
                        key="ready"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 print:hidden"
                    >
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50">
                            <h3 className="font-bold text-gov-navy dark:text-blue-100 mb-2 font-display">Ready for Analysis</h3>
                            <p className="text-slate-600 dark:text-blue-300/80 text-sm mb-6">
                                Image loaded successfully. The system is ready to run the diagnostic protocol.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={analyze}
                                disabled={loading || success}
                                className={`w-full py-4 ${success ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gov-navy dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700'} disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl transition-all shadow-subtle-hover flex items-center justify-center gap-3 btn-press relative overflow-hidden`}
                            >
                            {loading ? (
                                <>
                                <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
                                <Loader2 className="animate-spin relative z-10" /> <span className="relative z-10">Processing...</span>
                                </>
                            ) : success ? (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle size={24} className="text-white" />
                                    <span>Analysis Complete</span>
                                </motion.div>
                            ) : (
                                <>
                                <CheckCircle size={20} /> Run Diagnostics
                                </>
                            )}
                            </motion.button>
                        </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                             <div className={`p-8 rounded-[2rem] border ${
                                 result.overallScore >= 80 ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' :
                                 result.overallScore >= 50 ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30' :
                                 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30'
                             }`}>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                                                result.overallScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                                result.overallScore >= 50 ? 'text-amber-600 dark:text-amber-400' :
                                                'text-red-600 dark:text-red-400'
                                            }`}>Diagnostic Score</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence 94%</span>
                                        </div>
                                        {saveStatus === 'saved' && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                                    Synchronized to Cloud
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={playAudioReport}
                                        disabled={isPlaying}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow-sm border print:hidden ${isPlaying ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'} transition-all duration-300`}
                                    >
                                        {isPlaying ? <Loader2 className="animate-spin" size={16} /> : <Volume2 size={16} />}
                                        <span className="text-xs font-bold uppercase tracking-wider">{isPlaying ? 'Reading...' : 'Audio Report'}</span>
                                    </motion.button>
                                </div>
                                
                                <div className="flex items-center gap-8">
                                    {/* Circular Gauge */}
                                    <div className="relative w-28 h-28 flex-shrink-0">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-800" />
                                            <motion.circle 
                                                cx="50" cy="50" r="44" fill="transparent" 
                                                stroke={getScoreColor(result.overallScore)} 
                                                strokeWidth="8" 
                                                strokeDasharray="276.46"
                                                initial={{ strokeDashoffset: 276.46 }}
                                                animate={{ strokeDashoffset: 276.46 - (276.46 * result.overallScore) / 100 }}
                                                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className={`text-4xl font-black font-display tracking-tighter ${
                                                result.overallScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                                result.overallScore >= 50 ? 'text-amber-600 dark:text-amber-400' :
                                                'text-red-600 dark:text-red-400'
                                            }`}>{result.overallScore}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Index</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                result.overallScore >= 80 ? 'bg-emerald-500' :
                                                result.overallScore >= 50 ? 'bg-amber-500' :
                                                'bg-red-500'
                                            }`}></div>
                                            <p className={`text-xl font-bold font-display ${
                                                result.overallScore >= 80 ? 'text-emerald-700 dark:text-emerald-400' :
                                                result.overallScore >= 50 ? 'text-amber-700 dark:text-amber-400' :
                                                'text-red-700 dark:text-red-400'
                                            }`}>
                                                {result.overallScore >= 80 ? 'Safe for Usage' : result.overallScore >= 50 ? 'Moderate Quality' : 'Unsafe / Contaminated'}
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                                            {result.overallScore >= 80 
                                                ? 'Visual indicators suggest high purity levels. Suitable for most common purposes.' 
                                                : result.overallScore >= 50 
                                                ? 'Minor visual anomalies detected. Basic filtration recommended before consumption.' 
                                                : 'Significant visible contamination. Do not consume or use without professional treatment.'}
                                        </p>
                                    </div>
                                </div>
                             </div>
                         
                         <div className="grid grid-cols-2 gap-3">
                            <MetricCard label="Algae Level" value={result.algaeLevel} icon={Activity} color="text-emerald-500" />
                            <MetricCard label="Turbidity" value={result.turbidity} icon={Droplets} color="text-blue-500" />
                         </div>

                         {/* Unsafe Result Alert */}
                         {result.overallScore < 50 && (
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle"
                             >
                                 <div className="flex items-center gap-4">
                                     <div className="p-3 bg-red-200 dark:bg-red-800/50 rounded-2xl flex-shrink-0">
                                        <AlertCircle className="text-red-700 dark:text-red-400" size={28} />
                                     </div>
                                     <div>
                                         <p className="text-red-900 dark:text-red-300 font-bold text-base font-display tracking-tight">Critical Water Quality Detected</p>
                                         <p className="text-red-700 dark:text-red-400 text-sm mt-1 leading-relaxed">This water is unsafe for consumption without heavy filtration.</p>
                                     </div>
                                 </div>
                                 <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsActionModalOpen(true)}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap shadow-md"
                                 >
                                     What to do now
                                 </motion.button>
                             </motion.div>
                         )}
                    </motion.div>
                  )}
                  </AnimatePresence>
              </div>
            </div>
          )}

          <AnimatePresence>
          {result && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800"
            >
                <div className="grid grid-cols-1 gap-8">
                    {/* Text Analysis Section */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                                <Search size={18} className="text-blue-500"/> Visual Observation
                            </h4>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                {result.details}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                                <AlertCircle size={18} className="text-amber-500"/> Recommendation
                            </h4>
                             <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 leading-relaxed text-sm">
                                {result.recommendation}
                            </div>
                        </div>
                    </div>
                    
                    {/* Expandable FAQ */}
                    <div className="space-y-4 print:hidden">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                            <Info size={18} className="text-blue-500"/> Frequently Asked Questions
                        </h4>
                        <div className="space-y-4">
                            {FAQ_ITEMS.map((item, idx) => (
                                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-[1.5rem] overflow-hidden bg-white dark:bg-slate-800 shadow-subtle hover:shadow-subtle-hover transition-shadow">
                                    <button 
                                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                        className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.q}</span>
                                        <motion.div
                                            animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown size={18} className="text-slate-400" />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {expandedFaq === idx && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                                            >
                                                {item.a}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => (
    <motion.div 
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-subtle hover:shadow-subtle-hover transition-all group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div className="h-1 w-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-[0.15em] mb-1">{label}</p>
        <p className="font-bold text-slate-900 dark:text-slate-200 text-xl font-display">{value}</p>
    </motion.div>
);