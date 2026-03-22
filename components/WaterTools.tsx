import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Clock, Droplets, Info, CheckCircle, AlertTriangle, Thermometer, GlassWater } from 'lucide-react';

export const WaterTools = ({ language }: { language: 'en' | 'hi' }) => {
    const [activeTool, setActiveTool] = useState<'tds' | 'boil' | 'usage'>('tds');

    const tools = [
        { id: 'tds', label: language === 'en' ? 'TDS Checker' : 'टीडीएस चेकर', icon: Calculator },
        { id: 'boil', label: language === 'en' ? 'Boiling Timer' : 'उबालने का समय', icon: Clock },
        { id: 'usage', label: language === 'en' ? 'Usage Tracker' : 'उपयोग ट्रैकर', icon: Droplets },
    ];

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                        {language === 'en' ? 'Water Utilities' : 'जल उपयोगिताएँ'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        {language === 'en' ? 'Simple tools to help you manage your daily water needs.' : 'आपकी दैनिक पानी की जरूरतों को प्रबंधित करने में मदद करने के लिए सरल उपकरण।'}
                    </p>
                </div>

                <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeTool === tool.id 
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <tool.icon size={14} />
                            {tool.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTool}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    {activeTool === 'tds' && <TDSChecker language={language} />}
                    {activeTool === 'boil' && <BoilingTimer language={language} />}
                    {activeTool === 'usage' && <UsageTracker language={language} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const TDSChecker = ({ language }: { language: 'en' | 'hi' }) => {
    const [tds, setTds] = useState<string>('');
    
    const getTdsStatus = (val: number) => {
        if (val < 50) return { label: language === 'en' ? 'Low Minerals' : 'कम खनिज', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: AlertTriangle };
        if (val <= 300) return { label: language === 'en' ? 'Excellent' : 'उत्कृष्ट', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle };
        if (val <= 600) return { label: language === 'en' ? 'Good' : 'अच्छा', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Info };
        if (val <= 900) return { label: language === 'en' ? 'Fair' : 'ठीक', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: Info };
        return { label: language === 'en' ? 'Poor' : 'खराब', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: AlertTriangle };
    };

    const status = tds ? getTdsStatus(Number(tds)) : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-subtle">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <Calculator className="text-blue-500" size={20} />
                    {language === 'en' ? 'TDS Level Analyzer' : 'टीडीएस स्तर विश्लेषक'}
                </h3>
                <div className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">{language === 'en' ? 'Enter TDS Value (ppm)' : 'टीडीएस मान दर्ज करें (ppm)'}</label>
                        <input 
                            type="number" 
                            value={tds}
                            onChange={(e) => setTds(e.target.value)}
                            placeholder="e.g. 150"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {status && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-xl border ${status.bg} border-current/10 flex items-center gap-4`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color} bg-white dark:bg-slate-900 shadow-sm`}>
                                <status.icon size={20} />
                            </div>
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${status.color}`}>{language === 'en' ? 'Status' : 'स्थिति'}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{status.label}</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">{language === 'en' ? 'TDS Guidelines' : 'टीडीएस दिशानिर्देश'}</h4>
                <div className="space-y-3">
                    {[
                        { range: '50 - 300', label: language === 'en' ? 'Ideal for drinking' : 'पीने के लिए आदर्श', color: 'bg-emerald-500' },
                        { range: '300 - 600', label: language === 'en' ? 'Good for drinking' : 'पीने के लिए अच्छा', color: 'bg-blue-500' },
                        { range: '600 - 900', label: language === 'en' ? 'Fair' : 'ठीक', color: 'bg-orange-500' },
                        { range: '900+', label: language === 'en' ? 'Unacceptable' : 'अस्वीकार्य', color: 'bg-red-500' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                                <span className="font-bold text-xs">{item.range}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const BoilingTimer = ({ language }: { language: 'en' | 'hi' }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);

    React.useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startTimer = () => {
        setTimeLeft(60); // 1 minute
        setIsActive(true);
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-subtle text-center">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-6">
                <Thermometer size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{language === 'en' ? 'Safe Boiling Timer' : 'सुरक्षित उबालने का टाइमर'}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                {language === 'en' ? 'Boiling water for 1 minute kills most pathogens.' : '1 मिनट तक पानी उबालने से अधिकांश रोगजनक मर जाते हैं।'}
            </p>

            <div className="relative w-40 h-40 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r="74"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-800"
                    />
                    <motion.circle
                        cx="80"
                        cy="80"
                        r="74"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={465}
                        strokeDashoffset={465 - (465 * timeLeft) / 60}
                        className="text-amber-500"
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-mono font-bold">{timeLeft}s</span>
                </div>
            </div>

            <button 
                onClick={startTimer}
                disabled={isActive}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all ${isActive ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] shadow-lg'}`}
            >
                {isActive ? (language === 'en' ? 'Boiling...' : 'उबल रहा है...') : (language === 'en' ? 'Start 1 Min Timer' : '1 मिनट का टाइमर शुरू करें')}
            </button>
        </div>
    );
};

const UsageTracker = ({ language }: { language: 'en' | 'hi' }) => {
    const [glasses, setGlasses] = useState(0);
    const target = 8;

    return (
        <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold">{language === 'en' ? 'Water Intake' : 'पानी का सेवन'}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{language === 'en' ? 'Track your daily hydration' : 'अपने दैनिक हाइड्रेशन को ट्रैक करें'}</p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-bold text-blue-600">{glasses}</span>
                    <span className="text-slate-400 font-bold"> / {target}</span>
                </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-8">
                {Array.from({ length: target }).map((_, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setGlasses(i + 1)}
                        className={`aspect-[2/3] rounded-lg flex items-center justify-center transition-all border-2 ${
                            i < glasses 
                            ? 'bg-blue-500 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300'
                        }`}
                    >
                        <GlassWater size={20} />
                    </motion.button>
                ))}
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={() => setGlasses(0)}
                    className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest"
                >
                    {language === 'en' ? 'Reset' : 'रीसेट'}
                </button>
                <button 
                    onClick={() => setGlasses(prev => Math.min(target, prev + 1))}
                    className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all"
                >
                    {language === 'en' ? '+ Add Glass' : '+ गिलास जोड़ें'}
                </button>
            </div>
        </div>
    );
};
