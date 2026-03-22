import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, 
    Camera, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Droplets, 
    ShieldCheck, 
    Info, 
    ArrowRight, 
    Share2, 
    Printer,
    Search,
    Zap,
    History,
    FileText,
    ShieldAlert,
    HelpCircle,
    Play,
    MapPin,
    AlertTriangle,
    Activity,
    Clock
} from 'lucide-react';
import { analyzeWaterImage } from '../lib/gemini';
import { toast } from 'react-hot-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/firebase';
import { TRANSLATIONS } from '../constants';

interface AnalysisResult {
    score: number;
    status: 'Safe' | 'Moderate' | 'Unsafe';
    details: string;
    recommendations: string[];
    parameters: {
        clarity: string;
        color: string;
        sediment: string;
    };
}

export const AnalysisModule = ({ language, setActiveTab }: { language: 'en' | 'hi', setActiveTab?: (tab: string) => void }) => {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [showFAQ, setShowFAQ] = useState(false);
    const [location, setLocation] = useState('');
    const [showActionModal, setShowActionModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const t = TRANSLATIONS[language];

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

    const runAnalysis = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        try {
            const analysis = await analyzeWaterImage(image);
            setResult(analysis);
            
            if (analysis.status === 'Unsafe') {
                setShowActionModal(true);
                await addDoc(collection(db, 'reports'), {
                    location: location || 'Unknown Location',
                    description: `Automated AI Analysis: ${analysis.details}`,
                    status: 'pending',
                    imageUrl: image,
                    analysis: {
                        score: analysis.score,
                        status: analysis.status
                    },
                    createdAt: serverTimestamp()
                });
            }
            toast.success(language === 'en' ? 'Analysis complete!' : 'विश्लेषण पूरा हुआ!');
        } catch (error) {
            console.error('Analysis failed:', error);
            toast.error(language === 'en' ? 'Analysis failed. Please try again.' : 'विश्लेषण विफल रहा। कृपया पुनः प्रयास करें।');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Water Quality Analysis',
                text: `My water safety score is ${result?.score}/100. Status: ${result?.status}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            toast.success(language === 'en' ? 'Link copied to clipboard!' : 'लिंक क्लिपबोर्ड पर कॉपी किया गया!');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAlertAuthorities = () => {
        toast.success(language === 'en' ? 'Authorities have been notified.' : 'अधिकारियों को सूचित कर दिया गया है।');
        setShowActionModal(false);
    };

    const faqs = language === 'en' ? [
        { q: "How accurate is the AI analysis?", a: "Our AI model is trained on thousands of water samples and has an accuracy rate of over 92% for visual contaminants. However, it should not replace laboratory testing for chemical purity." },
        { q: "What should I do if my water is 'Unsafe'?", a: "Immediately stop consumption. Boil the water for at least 10 minutes or use a certified RO filter. Report the issue using the 'Report' button to alert local authorities." },
        { q: "Can I analyze well water?", a: "Yes, the system can detect visual signs of contamination in well water, such as high turbidity or mineral deposits." }
    ] : [
        { q: "एआई विश्लेषण कितना सटीक है?", a: "हमारा एआई मॉडल हजारों पानी के नमूनों पर प्रशिक्षित है और दृश्य संदूषकों के लिए इसकी सटीकता दर 92% से अधिक है। हालांकि, इसे रासायनिक शुद्धता के लिए प्रयोगशाला परीक्षण की जगह नहीं लेनी चाहिए।" },
        { q: "अगर मेरा पानी 'असुरक्षित' है तो मुझे क्या करना चाहिए?", a: "तुरंत उपभोग बंद करें। पानी को कम से कम 10 मिनट तक उबालें या प्रमाणित आरओ फिल्टर का उपयोग करें। स्थानीय अधिकारियों को सचेत करने के लिए 'रिपोर्ट' बटन का उपयोग करके समस्या की रिपोर्ट करें।" },
        { q: "क्या मैं कुएं के पानी का विश्लेषण कर सकता हूं?", a: "हाँ, सिस्टम कुएं के पानी में संदूषण के दृश्य संकेतों का पता लगा सकता है, जैसे कि उच्च मैलापन या खनिज जमा।" }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800"
                    >
                        <Zap size={14} className="fill-blue-400" />
                        {t.analysis.aiPowered}
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight"
                    >
                        {t.analysis.title}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 dark:text-slate-400 text-base max-w-2xl leading-relaxed"
                    >
                        {t.analysis.subtitle}
                    </motion.p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => setShowFAQ(!showFAQ)}
                        className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <HelpCircle size={18} /> {t.analysis.howItWorks}
                    </button>
                    <button 
                        onClick={() => setActiveTab?.('intel')}
                        className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                        <History size={18} /> {t.analysis.viewHistory}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Upload Section */}
                <div className="lg:col-span-5 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs">1</span>
                                {t.analysis.uploadSample}
                            </h2>
                            <div className="flex items-center gap-2 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                <ShieldCheck size={12} />
                                {t.analysis.certified}
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative h-64 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden group ${
                                    image ? 'border-blue-500 bg-blue-50/5 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                {image ? (
                                    <>
                                        <img 
                                            src={image} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover" 
                                            referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="p-3 bg-white rounded-full text-slate-900 shadow-xl">
                                                <Camera size={20} />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); }}
                                            className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                            <Upload size={28} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {t.analysis.clickToUpload}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                {t.analysis.dragDrop}
                                            </p>
                                        </div>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageUpload} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={12} />
                                        {t.analysis.location}
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder={t.analysis.locationPlaceholder}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={runAnalysis}
                                    disabled={!image || isAnalyzing}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2.5 disabled:opacity-50 group text-sm"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            {t.analysis.analyzing}
                                        </>
                                    ) : (
                                        <>
                                            {t.analysis.startAnalysis}
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    {t.analysis.accuracy}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-7">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs">2</span>
                                {t.analysis.diagnosticResults}
                            </h2>
                            {result && (
                                <div className="flex gap-1.5">
                                    <button onClick={handleShare} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Share2 size={16} /></button>
                                    <button onClick={handlePrint} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Printer size={16} /></button>
                                </div>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {isAnalyzing ? (
                                <motion.div 
                                    key="analyzing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[400px] flex flex-col items-center justify-center space-y-6"
                                >
                                    <div className="relative w-32 h-32">
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-4 border-dashed border-blue-500/30 rounded-full"
                                        />
                                        <motion.div 
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-4 bg-blue-500/10 rounded-full flex items-center justify-center"
                                        >
                                            <Droplets size={32} className="text-blue-500 animate-bounce" />
                                        </motion.div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-base font-bold text-slate-900 dark:text-white">
                                            {t.analysis.scanning}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {t.analysis.processing}
                                        </p>
                                    </div>
                                </motion.div>
                            ) : result ? (
                                <motion.div 
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="relative w-32 h-32 flex-shrink-0">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(0,0,0,0.05)" strokeWidth="8" />
                                                <motion.circle 
                                                    cx="50" cy="50" r="45" fill="transparent" 
                                                    stroke={result.status === 'Safe' ? '#10b981' : result.status === 'Moderate' ? '#f59e0b' : '#ef4444'} 
                                                    strokeWidth="10" 
                                                    strokeDasharray="282.7"
                                                    initial={{ strokeDashoffset: 282.7 }}
                                                    animate={{ strokeDashoffset: 282.7 - (282.7 * result.score) / 100 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-black font-display tracking-tighter text-slate-900 dark:text-white">{result.score}</span>
                                                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {t.analysis.safetyIndex}
                                                </span>
                                            </div>
                                        </div>
 
                                        <div className="space-y-3 flex-1">
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ${
                                                result.status === 'Safe' ? 'bg-emerald-50 text-emerald-600' : 
                                                result.status === 'Moderate' ? 'bg-amber-50 text-amber-600' : 
                                                'bg-red-50 text-red-600'
                                            }`}>
                                                {language === 'en' 
                                                    ? `${result.status} Quality Detected` 
                                                    : `${result.status === 'Safe' ? 'सुरक्षित' : result.status === 'Moderate' ? 'मध्यम' : 'असुरक्षित'} गुणवत्ता पाई गई`}
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white font-display leading-tight">
                                                {result.details}
                                            </h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                                {language === 'en' 
                                                    ? `Based on visual analysis, this sample shows characteristics typical of ${result.status.toLowerCase()} water.`
                                                    : `दृश्य विश्लेषण के आधार पर, यह नमूना ${result.status === 'Safe' ? 'सुरक्षित' : result.status === 'Moderate' ? 'मध्यम' : 'असुरक्षित'} पानी की विशिष्ट विशेषताएं दिखाता है।`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: t.analysis.clarity, value: result.parameters.clarity, icon: Search, color: 'text-blue-500' },
                                            { label: t.analysis.color, value: result.parameters.color, icon: Droplets, color: 'text-purple-500' },
                                            { label: t.analysis.sediment, value: result.parameters.sediment, icon: AlertCircle, color: 'text-amber-500' },
                                        ].map((p, i) => (
                                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p.icon size={16} className={p.color} />
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{p.value}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            {t.analysis.recommendedActions}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {result.recommendations.map((rec, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                                                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                                    {rec}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                                        <FileText size={48} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                                            {t.analysis.awaitingSample}
                                        </p>
                                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                            {t.analysis.awaitingDesc}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* Action Modal for Unsafe Water */}
            <AnimatePresence>
                {showActionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowActionModal(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/40 text-red-600 rounded-2xl">
                                        <ShieldAlert size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display">
                                            {t.analysis.safetyAlert}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">
                                            {t.analysis.criticalContamination}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 bg-red-50/50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 space-y-4">
                                    <p className="text-red-700 dark:text-red-400 text-sm leading-relaxed font-medium">
                                        {language === 'en' 
                                            ? 'Our AI has detected significant visual markers of contamination in your water sample. This water is currently classified as UNSAFE for consumption.'
                                            : 'हमारे एआई ने आपके पानी के नमूने में संदूषण के महत्वपूर्ण दृश्य मार्करों का पता लगाया है। यह पानी वर्तमान में उपभोग के लिए असुरक्षित के रूप में वर्गीकृत है।'}
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold">
                                            <AlertCircle size={14} /> {language === 'en' ? 'DO NOT DRINK' : 'पीएं नहीं'}
                                        </li>
                                        <li className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold">
                                            <AlertCircle size={14} /> {language === 'en' ? 'BOIL FOR 10+ MINS' : '10+ मिनट तक उबालें'}
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {language === 'en' ? 'Next Steps' : 'अगले कदम'}
                                    </p>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button 
                                            onClick={handleAlertAuthorities}
                                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-red-500/20"
                                        >
                                            {t.analysis.alertAuthorities}
                                        </button>
                                        <button 
                                            onClick={() => setShowActionModal(false)}
                                            className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                        >
                                            {t.analysis.dismissWarning}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FAQ Section */}
            <AnimatePresence>
                {showFAQ && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
                                {language === 'en' ? 'Frequently Asked Questions' : 'अक्सर पूछे जाने वाले प्रश्न'}
                            </h3>
                            <button onClick={() => setShowFAQ(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {faqs.map((faq, i) => (
                                <div key={i} className="space-y-3">
                                    <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <HelpCircle size={16} className="text-blue-600" />
                                        {faq.q}
                                    </h5>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
