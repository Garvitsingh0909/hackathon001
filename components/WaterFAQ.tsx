import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HelpCircle, 
    BookOpen, 
    ShieldCheck, 
    Droplets, 
    MessageCircle, 
    Search, 
    X, 
    ChevronDown, 
    ArrowRight 
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { toast } from 'react-hot-toast';

interface FAQItem {
    id: string;
    question: { en: string; hi: string };
    answer: { en: string; hi: string };
    category: 'general' | 'safety' | 'technical' | 'community';
}

const faqs: FAQItem[] = [
    {
        id: '1',
        category: 'safety',
        question: {
            en: "Is the water from Tamsa River safe for drinking?",
            hi: "क्या तमसा नदी का पानी पीने के लिए सुरक्षित है?"
        },
        answer: {
            en: "Direct consumption is not recommended. While some stretches are cleaner, industrial runoff and seasonal changes affect quality. Always use RO filtration or boil for at least 10 minutes.",
            hi: "सीधे सेवन की अनुशंसा नहीं की जाती है। हालांकि कुछ हिस्से साफ हैं, औद्योगिक अपशिष्ट और मौसमी बदलाव गुणवत्ता को प्रभावित करते हैं। हमेशा आरओ फिल्टर का उपयोग करें या कम से कम 10 मिनट तक उबालें।"
        }
    },
    {
        id: '2',
        category: 'technical',
        question: {
            en: "What does TDS mean in water quality?",
            hi: "पानी की गुणवत्ता में टीडीएस (TDS) का क्या अर्थ है?"
        },
        answer: {
            en: "TDS stands for Total Dissolved Solids. It represents the concentration of dissolved substances in water. For drinking, a TDS level between 50-150 mg/L is considered excellent.",
            hi: "टीडीएस का अर्थ है 'कुल घुले हुए ठोस पदार्थ'। यह पानी में घुले हुए पदार्थों की सांद्रता को दर्शाता है। पीने के लिए, 50-150 मिलीग्राम/लीटर के बीच टीडीएस स्तर उत्कृष्ट माना जाता है।"
        }
    },
    {
        id: '3',
        category: 'community',
        question: {
            en: "How can I report a water pollution incident?",
            hi: "मैं जल प्रदूषण की घटना की रिपोर्ट कैसे कर सकता हूँ?"
        },
        answer: {
            en: "You can use the 'Report' tab in this app to upload a photo and location. Our system will analyze the image and alert local authorities if critical levels are detected.",
            hi: "आप फोटो और स्थान अपलोड करने के लिए इस ऐप में 'रिपोर्ट' टैब का उपयोग कर सकते हैं। हमारा सिस्टम छवि का विश्लेषण करेगा और गंभीर स्तर पाए जाने पर स्थानीय अधिकारियों को सचेत करेगा।"
        }
    },
    {
        id: '4',
        category: 'safety',
        question: {
            en: "What are the signs of contaminated water?",
            hi: "दूषित पानी के लक्षण क्या हैं?"
        },
        answer: {
            en: "Look for unusual odors (sulfur or metallic), cloudiness (turbidity), or strange colors. If the water has a soapy feel or leaves stains, it may contain high levels of chemicals or minerals.",
            hi: "असामान्य गंध (सल्फर या धातु), धुंधलापन, या अजीब रंगों की जाँच करें। यदि पानी साबुन जैसा महसूस होता है या दाग छोड़ता है, तो इसमें रसायनों या खनिजों का उच्च स्तर हो सकता है।"
        }
    },
    {
        id: '5',
        category: 'general',
        question: {
            en: "How often should I clean my water storage tank?",
            hi: "मुझे अपना पानी भंडारण टैंक कितनी बार साफ करना चाहिए?"
        },
        answer: {
            en: "It is recommended to clean and disinfect your water storage tank at least once every six months to prevent the growth of bacteria and algae.",
            hi: "बैक्टीरिया और शैवाल के विकास को रोकने के लिए हर छह महीने में कम से कम एक बार अपने पानी के भंडारण टैंक को साफ और कीटाणुरहित करने की सिफारिश की जाती है।"
        }
    }
];

export const WaterFAQ = ({ language }: { language: 'en' | 'hi' }) => {
    const t = TRANSLATIONS[language].common;
    const [searchQuery, setSearchQuery] = useState('');
    const [openId, setOpenId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'safety' | 'technical' | 'community'>('all');

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesSearch = 
                faq.question[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer[language].toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory, language]);

    const categories = [
        { id: 'all', label: { en: 'All', hi: 'सभी' }, icon: HelpCircle },
        { id: 'general', label: { en: 'General', hi: 'सामान्य' }, icon: BookOpen },
        { id: 'safety', label: { en: 'Safety', hi: 'सुरक्षा' }, icon: ShieldCheck },
        { id: 'technical', label: { en: 'Technical', hi: 'तकनीकी' }, icon: Droplets },
        { id: 'community', label: { en: 'Community', hi: 'समुदाय' }, icon: MessageCircle },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800"
                >
                    <HelpCircle size={14} />
                    {t.knowledgeBase}
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-display tracking-tight"
                >
                    {language === 'en' ? 'Frequently Asked' : 'अक्सर पूछे जाने वाले'} <span className="text-blue-600">{t.questions}</span>
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto"
                >
                    {t.faqDesc}
                </motion.p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-6">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-subtle"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                                activeCategory === cat.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
                            }`}
                        >
                            <cat.icon size={14} />
                            {cat.label[language]}
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <motion.div
                                key={faq.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group bg-white dark:bg-slate-900 border rounded-[2rem] overflow-hidden transition-all ${
                                    openId === faq.id 
                                    ? 'border-blue-500/50 shadow-lg ring-4 ring-blue-500/5' 
                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-subtle'
                                }`}
                            >
                                <button
                                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl transition-colors ${
                                            openId === faq.id ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                            {faq.category === 'safety' && <ShieldCheck size={18} />}
                                            {faq.category === 'technical' && <Droplets size={18} />}
                                            {faq.category === 'community' && <MessageCircle size={18} />}
                                            {faq.category === 'general' && <BookOpen size={18} />}
                                        </div>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                            {faq.question[language]}
                                        </span>
                                    </div>
                                    <ChevronDown 
                                        size={20} 
                                        className={`text-slate-400 transition-transform duration-300 ${openId === faq.id ? 'rotate-180 text-blue-600' : ''}`} 
                                    />
                                </button>
                                
                                <AnimatePresence>
                                    {openId === faq.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        >
                                            <div className="px-8 pb-8 pt-2">
                                                <div className="pl-12 border-l-2 border-blue-100 dark:border-blue-900/40">
                                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                                                        {faq.answer[language]}
                                                    </p>
                                                    <div className="mt-6 flex items-center gap-4">
                                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 uppercase tracking-widest">
                                                            {t.helpful}
                                                        </button>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => toast.success(language === 'en' ? 'Thanks for your feedback!' : 'आपकी प्रतिक्रिया के लिए धन्यवाद!')}
                                                                className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                            >
                                                                {t.yes}
                                                            </button>
                                                            <button 
                                                                onClick={() => toast.success(language === 'en' ? 'Thanks! We will improve this.' : 'धन्यवाद! हम इसमें सुधार करेंगे।')}
                                                                className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
                                                            >
                                                                {t.no}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800"
                        >
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-subtle">
                                <Search size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.noResults}</h3>
                            <p className="text-slate-500">{t.tryAdjust}</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                            >
                                {t.clearFilters}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Support CTA */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.2),transparent_50%)]"></div>
                <div className="relative z-10 space-y-2">
                    <h3 className="text-2xl font-bold font-display">{t.stillQuestions}</h3>
                    <p className="text-slate-400">{t.supportDesc}</p>
                </div>
                <button className="relative z-10 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all flex items-center gap-2 shadow-xl group">
                    {t.contactSupport} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        </div>
    );
};
