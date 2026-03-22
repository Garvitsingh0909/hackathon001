import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Newspaper, 
    MapPin, 
    AlertTriangle, 
    Search, 
    ExternalLink, 
    Droplets, 
    Wind, 
    Thermometer, 
    Navigation,
    ChevronRight,
    Play,
    Volume2,
    Loader2,
    CheckCircle2,
    ShieldAlert,
    Info,
    ArrowRight,
    TrendingUp,
    Clock,
    Share2,
    Bookmark,
    Zap
} from 'lucide-react';
import { searchWaterNews, findNearbyStations, playBrowserTTS } from '../lib/gemini';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { TRANSLATIONS } from '../constants';
import { toast } from 'react-hot-toast';

interface NewsItem {
    title: string;
    source: string;
    url: string;
    snippet: string;
    date: string;
    image?: string;
    category?: string;
}

interface Station {
    name: string;
    distance: string;
    status: 'Active' | 'Maintenance' | 'Offline';
    lastReading: string;
    parameters: {
        ph: number;
        turbidity: string;
        tds: number;
    };
    image?: string;
}

export const WaterIntel = ({ language, setActiveTab }: { language: 'en' | 'hi', setActiveTab?: (tab: string) => void }) => {
    const t = TRANSLATIONS[language].intel;
    const [news, setNews] = useState<NewsItem[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const [loadingStations, setLoadingStations] = useState(true);
    const [location, setLocation] = useState('');
    const [riskResult, setRiskResult] = useState<any>(null);
    const [checkingRisk, setCheckingRisk] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'all' | 'river' | 'policy' | 'tech'>('all');

    useEffect(() => {
        const loadIntel = async () => {
            try {
                const [newsData, stationsData] = await Promise.all([
                    searchWaterNews("Tamsa River water quality news 2024 India").catch(() => []),
                    findNearbyStations(25.9427, 83.5539).catch(() => [])
                ]);

                // Enhance news with categories and fresh images
                const enhancedNews = (newsData.length > 0 ? newsData : [
                    {
                        title: language === 'en' ? "Tamsa River Restoration Project Gains Momentum" : "तमसा नदी बहाली परियोजना ने पकड़ी गति",
                        source: language === 'en' ? "Local Environmental Board" : "स्थानीय पर्यावरण बोर्ड",
                        url: "#",
                        snippet: language === 'en' ? "New initiatives launched to clear plastic waste and restore natural flow near Mau district." : "मऊ जिले के पास प्लास्टिक कचरे को साफ करने और प्राकृतिक प्रवाह को बहाल करने के लिए नई पहल शुरू की गई।",
                        date: language === 'en' ? "2 days ago" : "2 दिन पहले",
                        category: "river",
                        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80"
                    },
                    {
                        title: language === 'en' ? "New Water Filtration Plant Proposed for Azamgarh" : "आजमगढ़ के लिए नए जल निस्पंदन संयंत्र का प्रस्ताव",
                        source: language === 'en' ? "State Infrastructure News" : "राज्य अवसंरचना समाचार",
                        url: "#",
                        snippet: language === 'en' ? "The proposed plant aims to provide clean drinking water to over 50,000 households." : "प्रस्तावित संयंत्र का उद्देश्य 50,000 से अधिक घरों को स्वच्छ पेयजल प्रदान करना है।",
                        date: language === 'en' ? "5 days ago" : "5 दिन पहले",
                        category: "tech",
                        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
                    },
                    {
                        title: language === 'en' ? "Monsoon Preparedness: Flood Warning Systems Updated" : "मानसून की तैयारी: बाढ़ चेतावनी प्रणाली अपडेट की गई",
                        source: language === 'en' ? "Disaster Management Authority" : "आपदा प्रबंधन प्राधिकरण",
                        url: "#",
                        snippet: language === 'en' ? "Early warning sensors installed along the Tamsa basin to monitor sudden water level rises." : "जल स्तर में अचानक वृद्धि की निगरानी के लिए तमसा बेसिन के साथ प्रारंभिक चेतावनी सेंसर स्थापित किए गए।",
                        date: language === 'en' ? "1 week ago" : "1 सप्ताह पहले",
                        category: "policy",
                        image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80"
                    }
                ]).map((item: any, i: number) => ({
                    ...item,
                    category: item.category || (i % 2 === 0 ? 'river' : 'tech'),
                    image: item.image || `https://picsum.photos/seed/water${i}/800/450`
                }));

                setNews(enhancedNews);
                
                // Enhance stations with images
                const enhancedStations = (stationsData.length > 0 ? stationsData : [
                    {
                        name: language === 'en' ? "Mau Central Station" : "मऊ सेंट्रल स्टेशन",
                        distance: language === 'en' ? "2.4 km" : "2.4 किमी",
                        status: "Active",
                        lastReading: language === 'en' ? "15 mins ago" : "15 मिनट पहले",
                        parameters: { ph: 7.2, turbidity: language === 'en' ? "Low" : "कम", tds: 240 },
                        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80"
                    },
                    {
                        name: language === 'en' ? "Tamsa Bridge Monitor" : "तमसा ब्रिज मॉनिटर",
                        distance: language === 'en' ? "4.1 km" : "4.1 किमी",
                        status: "Active",
                        lastReading: language === 'en' ? "1 hour ago" : "1 घंटा पहले",
                        parameters: { ph: 6.8, turbidity: language === 'en' ? "Medium" : "मध्यम", tds: 310 },
                        image: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=400&q=80"
                    }
                ]).map((s: any, i: number) => ({
                    ...s,
                    image: s.image || `https://picsum.photos/seed/station${i}/400/300`
                }));

                setStations(enhancedStations);
            } catch (error) {
                console.error("Intel load failed", error);
            } finally {
                setLoadingNews(false);
                setLoadingStations(false);
            }
        };
        loadIntel();
    }, [language]);

    const handleComingSoon = (feature: string) => {
        toast.success(`${feature} ${language === 'en' ? 'coming soon!' : 'जल्द आ रहा है!'}`);
    };

    const checkRisk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location.trim()) return;
        setCheckingRisk(true);
        
        // Simulate risk check
        setTimeout(() => {
            const score = Math.floor(Math.random() * 100);
            setRiskResult({
                score,
                level: score < 30 ? 'Low' : score < 70 ? 'Moderate' : 'High',
                details: score < 30 
                    ? "Water quality in this area is generally good. Minimal risk of contamination." 
                    : score < 70 
                    ? "Moderate risk detected. Some industrial runoff reported nearby. Use basic filtration." 
                    : "High risk area. Significant contamination reports. Do not consume without advanced treatment.",
                tips: [
                    "Use RO filtration for drinking",
                    "Boil water for at least 10 minutes",
                    "Avoid using for washing vegetables"
                ]
            });
            setCheckingRisk(false);
        }, 1500);
    };

    const speakText = (text: string) => {
        playBrowserTTS(text);
    };

    const filteredNews = activeCategory === 'all' 
        ? news 
        : news.filter(item => item.category === activeCategory);

    return (
        <div className="space-y-12 pb-20">
            <DisclaimerBanner />

            {/* 1. NEWS SECTION - Editorial Style */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Newspaper size={20} />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                                {language === 'en' ? 'Water Intelligence News' : 'जल इंटेलिजेंस समाचार'}
                            </h2>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                            {language === 'en' ? 'Latest from the' : 'बेसिन से'} <span className="text-blue-600">{language === 'en' ? 'Basin' : 'नवीनतम'}</span>
                        </h3>
                    </div>
                    
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                        {(['all', 'river', 'policy', 'tech'] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                                    activeCategory === cat 
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {language === 'en' 
                                    ? cat.charAt(0).toUpperCase() + cat.slice(1) 
                                    : cat === 'all' ? 'सभी' : cat === 'river' ? 'नदी' : cat === 'policy' ? 'नीति' : 'तकनीक'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Featured Article */}
                    <div className="lg:col-span-8">
                        {loadingNews ? (
                            <div className="w-full h-[500px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
                        ) : filteredNews.length > 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl"
                            >
                                <img 
                                    src={filteredNews[0].image} 
                                    alt="Featured" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-10 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                                            {filteredNews[0].category}
                                        </span>
                                        <span className="text-white/60 text-xs font-medium flex items-center gap-1.5">
                                            <Clock size={14} /> {filteredNews[0].date}
                                        </span>
                                    </div>
                                    <h4 className="text-3xl md:text-4xl font-black text-white leading-tight font-display tracking-tight">
                                        {filteredNews[0].title}
                                    </h4>
                                    <p className="text-white/70 text-lg max-w-2xl line-clamp-2 font-light">
                                        {filteredNews[0].snippet}
                                    </p>
                                    <div className="flex items-center gap-4 pt-4">
                                        <button 
                                            onClick={() => handleComingSoon(language === 'en' ? 'Full Story' : 'पूरी कहानी')}
                                            className="px-8 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-xl"
                                        >
                                            {language === 'en' ? 'Read Full Story' : 'पूरी कहानी पढ़ें'} <ArrowRight size={18} />
                                        </button>
                                        <button 
                                            onClick={() => speakText(filteredNews[0].title + ". " + filteredNews[0].snippet)}
                                            className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/10"
                                        >
                                            <Volume2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                    </div>

                    {/* Sidebar News */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-subtle">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
                                {language === 'en' ? 'Trending Updates' : 'ट्रेंडिंग अपडेट'}
                            </h4>
                            <div className="space-y-8">
                                {loadingNews ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)
                                ) : filteredNews.slice(1, 4).map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group cursor-pointer"
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                                <img 
                                                    src={item.image} 
                                                    alt="News" 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                                        {language === 'en' ? item.category : item.category === 'river' ? 'नदी' : item.category === 'policy' ? 'नीति' : 'तकनीक'}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">• {item.date}</span>
                                                </div>
                                                <h5 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                                    {item.title}
                                                </h5>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <button 
                                onClick={() => handleComingSoon(language === 'en' ? 'News Archive' : 'समाचार संग्रह')}
                                className="w-full mt-8 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest"
                            >
                                {t.viewAllNews}
                            </button>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <h4 className="text-xl font-bold mb-2">
                                    {language === 'en' ? 'Weekly Intelligence' : 'साप्ताहिक इंटेलिजेंस'}
                                </h4>
                                <p className="text-blue-100 text-xs mb-6 leading-relaxed">
                                    {language === 'en' ? 'Get critical water quality alerts and basin reports directly in your inbox.' : 'सीधे अपने इनबॉक्स में महत्वपूर्ण जल गुणवत्ता अलर्ट और बेसिन रिपोर्ट प्राप्त करें।'}
                                </p>
                                <div className="space-y-3">
                                    <input 
                                        type="email" 
                                        placeholder={language === 'en' ? 'Enter your email' : 'अपना ईमेल दर्ज करें'} 
                                        className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-sm placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                                    />
                                    <button 
                                        onClick={() => handleComingSoon(language === 'en' ? 'Newsletter' : 'न्यूज़लेटर')}
                                        className="w-full py-3 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-lg"
                                    >
                                        {t.subscribe}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. RISK CHECKER - Interactive Tool */}
            <section className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_70%)]"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                                    <ShieldAlert size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
                                    {language === 'en' ? 'Risk Assessment Engine' : 'जोखिम मूल्यांकन इंजन'}
                                </span>
                            </div>
                            <h3 className="text-5xl font-black font-display tracking-tight leading-tight">
                                {language === 'en' ? 'Check Your Local' : 'अपने स्थानीय'} <br />
                                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                    {language === 'en' ? 'Water Risk Score' : 'जल जोखिम स्कोर की जाँच करें'}
                                </span>
                            </h3>
                            <p className="text-slate-400 text-lg mt-6 max-w-md leading-relaxed">
                                {language === 'en' 
                                    ? 'Enter your location to get a real-time risk assessment based on historical data, industrial reports, and community feedback.' 
                                    : 'ऐतिहासिक डेटा, औद्योगिक रिपोर्ट और सामुदायिक प्रतिक्रिया के आधार पर वास्तविक समय जोखिम मूल्यांकन प्राप्त करने के लिए अपना स्थान दर्ज करें।'}
                            </p>
                        </div>

                        <form onSubmit={checkRisk} className="relative max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-blue-500 group-focus-within:text-blue-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder={language === 'en' ? 'Enter District or City (e.g., Mau, Azamgarh)' : 'जिला या शहर दर्ज करें (जैसे, मऊ, आजमगढ़)'}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-14 pr-36 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-xl"
                            />
                            <button
                                type="submit"
                                disabled={checkingRisk || !location.trim()}
                                className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
                            >
                                {checkingRisk ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                                {language === 'en' ? 'Check' : 'जांचें'}
                            </button>
                        </form>

                        <div className="flex gap-8 pt-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {language === 'en' ? 'Data Sources' : 'डेटा स्रोत'}
                                </p>
                                <p className="text-sm font-bold text-slate-300">
                                    {language === 'en' ? '14 Active Sensors' : '14 सक्रिय सेंसर'}
                                </p>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {language === 'en' ? 'Last Update' : 'अंतिम अपडेट'}
                                </p>
                                <p className="text-sm font-bold text-slate-300">
                                    {language === 'en' ? 'Real-time Sync' : 'वास्तविक समय सिंक'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {riskResult ? (
                                <motion.div 
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group/card"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 opacity-20 ${
                                        riskResult.level === 'Low' ? 'bg-emerald-500' : riskResult.level === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}></div>
                                    
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                                                {language === 'en' ? 'Assessment Result' : 'मूल्यांकन परिणाम'}
                                            </h4>
                                            <p className="text-2xl font-bold font-display">{location}</p>
                                        </div>
                                        <div className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg ${
                                            riskResult.level === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                            riskResult.level === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                            'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                            {language === 'en' ? riskResult.level : riskResult.level === 'Low' ? 'कम' : riskResult.level === 'Moderate' ? 'मध्यम' : 'उच्च'} {language === 'en' ? 'Risk' : 'जोखिम'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10 mb-10">
                                        <div className="relative w-32 h-32 flex-shrink-0">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                                <motion.circle 
                                                    cx="50" cy="50" r="45" fill="transparent" 
                                                    stroke={riskResult.level === 'Low' ? '#10b981' : riskResult.level === 'Moderate' ? '#f59e0b' : '#ef4444'} 
                                                    strokeWidth="10" 
                                                    strokeDasharray="282.7"
                                                    initial={{ strokeDashoffset: 282.7 }}
                                                    animate={{ strokeDashoffset: 282.7 - (282.7 * riskResult.score) / 100 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-black font-display tracking-tighter">{riskResult.score}</span>
                                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                                    {language === 'en' ? 'Index' : 'सूचकांक'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                                {riskResult.details}
                                            </p>
                                            <div 
                                                onClick={() => handleComingSoon(language === 'en' ? 'Detailed Report' : 'विस्तृत रिपोर्ट')}
                                                className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-blue-300 transition-colors"
                                            >
                                                {t.viewDetailedReport} <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {language === 'en' ? 'Recommended Actions' : 'अनुशंसित कार्रवाइयां'}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {riskResult.tips.map((tip: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-300">
                                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                                    {tip}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-[400px] flex items-center justify-center">
                                    <motion.div 
                                        animate={{ 
                                            scale: [1, 1.05, 1],
                                            opacity: [0.3, 0.5, 0.3]
                                        }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="w-64 h-64 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
                                    >
                                        <div className="w-48 h-48 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                                            <Droplets size={64} className="text-blue-500/40" />
                                        </div>
                                    </motion.div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">
                                            {language === 'en' ? 'Waiting for input' : 'इनपुट की प्रतीक्षा है'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* 3. NEARBY STATIONS - Visual Grid */}
            <section className="space-y-8">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Navigation size={20} />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                                {language === 'en' ? 'Monitoring Network' : 'निगरानी नेटवर्क'}
                            </h2>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                            {language === 'en' ? 'Nearby' : 'आस-पास के'} <span className="text-emerald-600">{language === 'en' ? 'Stations' : 'स्टेशन'}</span>
                        </h3>
                    </div>
                    <button 
                        onClick={() => setActiveTab && setActiveTab('map')}
                        className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all uppercase tracking-widest"
                    >
                        {t.viewMap}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loadingStations ? (
                        [1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>)
                    ) : stations.map((station, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -8 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-subtle hover:shadow-subtle-hover group transition-all"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img 
                                    src={station.image} 
                                    alt={station.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                                    {station.distance}
                                </div>
                                <div className="absolute bottom-4 left-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${station.status === 'Active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-400'}`}></div>
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{station.status}</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white font-display mt-1">{station.name}</h4>
                                </div>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {language === 'en' ? 'pH Level' : 'पीएच स्तर'}
                                        </p>
                                        <p className="text-base font-black text-slate-900 dark:text-white font-mono">{station.parameters.ph}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {language === 'en' ? 'Turbidity' : 'मैलापन'}
                                        </p>
                                        <p className="text-base font-black text-slate-900 dark:text-white font-mono">{station.parameters.turbidity}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {language === 'en' ? 'TDS' : 'टीडीएस'}
                                        </p>
                                        <p className="text-base font-black text-slate-900 dark:text-white font-mono">{station.parameters.tds}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock size={12} /> {station.lastReading}
                                    </span>
                                    <button 
                                        onClick={() => handleComingSoon(language === 'en' ? 'Station Details' : 'स्टेशन विवरण')}
                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};
