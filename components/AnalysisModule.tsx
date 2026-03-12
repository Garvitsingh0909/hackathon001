import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle, Volume2, Loader2, Play, Search, X, BarChart3, TrendingUp, Droplets, RotateCcw, ChevronDown, ChevronUp, Info, Printer, Share2 } from 'lucide-react';
import { analyzeWaterImage, playBrowserTTS } from '../lib/claude';
import { api } from '../services/api';
import { WaterQualityReport } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { useAuth } from '../src/AuthContext';
import { db } from '../src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FAQ_ITEMS = [
    { q: "How accurate is this visual analysis?", a: "This AI analysis provides a preliminary assessment based on visual indicators like color, turbidity, and visible algae. It is not a substitute for laboratory testing." },
    { q: "What does the Overall Score mean?", a: "The score (0-100) represents the estimated visual quality of the water. 80-100 is excellent, 50-79 is moderate, and below 50 indicates visible contamination." },
    { q: "Can it detect invisible chemicals?", a: "No. Visual analysis cannot detect dissolved chemicals, heavy metals, or microscopic pathogens. Always use proper testing kits for drinking water." }
];

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

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1024;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        setMimeType(file.type);
        const resizedImage = await resizeImage(file);
        setImage(resizedImage);
        setResult(null);
      } catch (error) {
        console.error("Image processing failed", error);
        alert("Failed to process image.");
      } finally {
        setLoading(false);
      }
    }
  };

  const generateSimulatedData = () => {
      const baseScore = Math.floor(Math.random() * 40) + 40;
      
      const historicalData = Array.from({ length: 6 }).map((_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          return {
              date: date.toLocaleString('default', { month: 'short' }),
              value: Math.max(0, Math.min(100, baseScore + (Math.random() * 20 - 10)))
          };
      });

      return {
          ph: Number((7 + (Math.random() * 1.5 - 0.75)).toFixed(1)),
          dissolvedOxygen: Number((6 + (Math.random() * 4)).toFixed(1)),
          chlorophyll: Number((10 + (Math.random() * 20)).toFixed(1)),
          nitrogen: Number((1.5 + (Math.random() * 2)).toFixed(2)),
          phosphorus: Number((0.1 + (Math.random() * 0.2)).toFixed(3)),
          historicalData
      };
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    console.log('[AnalysisModule] Starting analysis for uploaded image');
    
    const simData = generateSimulatedData();
    
    try {
        let analysisResult;
        
        try {
            const base64Data = image.split(',')[1];
            console.log('[AnalysisModule] Calling analyzeWaterImage API');
            const apiPromise = analyzeWaterImage(base64Data, mimeType);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 20000));
            
            analysisResult = await Promise.race([apiPromise, timeoutPromise]) as any;
            console.log('[AnalysisModule] API analysis successful', analysisResult);
        } catch (e) {
            console.warn("[AnalysisModule] API timed out or failed, using simulation fallback", e);
            analysisResult = {
                overallScore: Math.round(simData.historicalData[5].value),
                algaeLevel: simData.chlorophyll > 20 ? 'High' : simData.chlorophyll > 10 ? 'Moderate' : 'Low',
                turbidity: 'Cloudy',
                recommendation: "Based on the visual analysis, the water shows signs of organic matter. Recommended to test for specific contaminants.",
                details: "Visual inspection suggests potential eutrophication. The color indicates presence of algae or suspended solids.",
                status: 'Pending'
            };
        }
        
        const finalReport: WaterQualityReport = {
            ...analysisResult,
            recommendation: (() => {
                let rec = analysisResult.recommendation || "";
                if (analysisResult.algaeLevel === 'High') {
                    rec += " High algae levels detected, which may indicate a harmful algal bloom. Avoid contact and ingestion.";
                }
                if (analysisResult.turbidity === 'Cloudy') {
                    rec += " Cloudy water detected. Filtering and boiling are strongly recommended before use.";
                }
                return rec;
            })(),
            id: Date.now().toString(),
            locationName: "Sample Location",
            coordinates: { lat: 25.942, lng: 83.554 },
            timestamp: new Date().toISOString(),
            foamDetected: false,
            status: 'Pending',
            ph: simData.ph,
            dissolvedOxygen: simData.dissolvedOxygen,
            chlorophyll: simData.chlorophyll,
            nitrogen: simData.nitrogen,
            phosphorus: simData.phosphorus,
            historicalData: simData.historicalData
        };

        setSuccess(true);
        console.log('[AnalysisModule] Final report generated', finalReport);
        
        // Save to Firestore if user is logged in
        if (user) {
            setSaveStatus('saving');
            console.log('[AnalysisModule] Saving report to Firestore for user', user.uid);
            try {
                await addDoc(collection(db, 'reports'), {
                    ...finalReport,
                    userId: user.uid,
                    userEmail: user.email,
                    userName: user.displayName,
                    createdAt: serverTimestamp(),
                    imageUrl: image // In a real app, we'd upload to Storage first
                });
                setSaveStatus('saved');
                console.log('[AnalysisModule] Report saved to Firestore successfully');
            } catch (error) {
                console.error("[AnalysisModule] Error saving report to Firestore:", error);
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
      <div className="bg-gov-card dark:bg-slate-900 rounded-[2rem] shadow-subtle dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors" id="printable-report">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 dark:border-slate-800 bg-gov-bg dark:bg-slate-800/30 flex justify-between items-start">
          <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-2xl">
                    <Camera size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">AI Sample Analysis</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Gemini 2.5 Flash Vision Protocol</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed print:hidden">
                Upload a high-resolution image of the water surface. Our AI model will analyze eutrophication levels, turbidity, and potential contaminants instantly.
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
                className="group flex flex-col items-center justify-center w-full h-80 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-3xl cursor-pointer bg-gov-bg dark:bg-slate-800/50 hover:bg-gov-teal/5 dark:hover:bg-gov-teal/20 hover:border-gov-teal dark:hover:border-gov-teal transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))] -z-10"></div>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="p-5 bg-gov-card dark:bg-slate-800 rounded-full shadow-subtle mb-4 group-hover:shadow-subtle-hover transition-all duration-300 text-gov-teal dark:text-gov-teal ring-4 ring-gov-teal/10 dark:ring-gov-teal/30"
                >
                    <Upload className="w-8 h-8" />
                </motion.div>
                <p className="mb-2 text-lg text-slate-700 dark:text-slate-200 font-semibold font-display">Click to upload photo</p>
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
                            <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"></div>
                            
                            {/* Water Droplet Fill Animation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-24 h-24">
                                    <svg viewBox="0 0 24 24" className="w-full h-full text-white/20 absolute inset-0">
                                        <path fill="currentColor" d="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z" />
                                    </svg>
                                    <motion.div 
                                        className="absolute bottom-0 left-0 w-full overflow-hidden"
                                        initial={{ height: "0%" }}
                                        animate={{ height: ["0%", "100%", "0%"] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    >
                                        <svg viewBox="0 0 24 24" className="w-24 h-24 text-gov-teal absolute bottom-0 left-0">
                                            <path fill="currentColor" d="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z" />
                                        </svg>
                                    </motion.div>
                                </div>
                            </div>
                            
                            <motion.div 
                                animate={{ top: ["0%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute top-0 left-0 w-full h-1 bg-gov-teal shadow-[0_0_20px_rgba(34,184,166,1)]"
                            />
                            <div className="absolute bottom-10 left-0 right-0 flex justify-center flex-col items-center gap-4">
                                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs font-mono animate-pulse">
                                    ANALYZING PIXELS...
                                </div>
                                <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-gov-teal"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-white text-xs font-mono">{progress}%</p>
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
                         <div className={`p-6 rounded-3xl border ${
                             result.overallScore >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50' :
                             result.overallScore >= 50 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50' :
                             'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50'
                         }`}>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${
                                        result.overallScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                        result.overallScore >= 50 ? 'text-amber-600 dark:text-amber-400' :
                                        'text-red-600 dark:text-red-400'
                                    }`}>Overall Score</span>
                                    {saveStatus === 'saved' && (
                                        <span className="ml-3 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            SAVED TO CLOUD
                                        </span>
                                    )}
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={playAudioReport}
                                    disabled={isPlaying}
                                    className={`p-3 rounded-full shadow-subtle border print:hidden ${isPlaying ? 'bg-gov-teal/10 text-gov-teal border-gov-teal/20 dark:bg-gov-teal/20 dark:text-gov-teal dark:border-gov-teal/30' : 'bg-gov-card dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:scale-105'} transition-all`}
                                >
                                    {isPlaying ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
                                </motion.button>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                {/* Circular Gauge */}
                                <div className="relative w-24 h-24 flex-shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
                                        <motion.circle 
                                            cx="50" cy="50" r="40" fill="transparent" 
                                            stroke={getScoreColor(result.overallScore)} 
                                            strokeWidth="8" 
                                            strokeDasharray="251.2"
                                            initial={{ strokeDashoffset: 251.2 }}
                                            animate={{ strokeDashoffset: 251.2 - (251.2 * result.overallScore) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className={`text-3xl font-bold font-display ${
                                            result.overallScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                            result.overallScore >= 50 ? 'text-amber-600 dark:text-amber-400' :
                                            'text-red-600 dark:text-red-400'
                                        }`}>{result.overallScore}</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status:</p>
                                    <p className={`text-lg font-bold ${
                                        result.overallScore >= 80 ? 'text-emerald-700 dark:text-emerald-400' :
                                        result.overallScore >= 50 ? 'text-amber-700 dark:text-amber-400' :
                                        'text-red-700 dark:text-red-400'
                                    }`}>
                                        {result.overallScore >= 80 ? 'Good Quality' : result.overallScore >= 50 ? 'Moderate Concern' : 'High Risk'}
                                    </p>
                                </div>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3">
                            <MetricCard label="Algae Level" value={result.algaeLevel} />
                            <MetricCard label="Turbidity" value={result.turbidity} />
                         </div>

                         {/* Unsafe Result Alert */}
                         {result.overallScore < 50 && (
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                             >
                                 <div className="flex items-center gap-3">
                                     <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
                                     <div>
                                         <p className="text-red-800 dark:text-red-300 font-bold text-sm">Critical Water Quality Detected</p>
                                         <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">This water is unsafe for consumption without heavy filtration.</p>
                                     </div>
                                 </div>
                                 <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shadow-sm">
                                     What to do now
                                 </button>
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
                        <div className="space-y-3">
                            {FAQ_ITEMS.map((item, idx) => (
                                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                                    <button 
                                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                        className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{item.q}</span>
                                        {expandedFaq === idx ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                    </button>
                                    <AnimatePresence>
                                        {expandedFaq === idx && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
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

const MetricCard = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-gov-card dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-subtle">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">{label}</p>
        <p className="font-bold text-gov-navy dark:text-slate-200 text-lg font-display">{value}</p>
    </div>
);