import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    MessageSquare, 
    Star, 
    ThumbsUp, 
    AlertCircle, 
    CheckCircle2, 
    Loader2,
    Heart,
    Bug,
    Lightbulb,
    User,
    Mail,
    ArrowRight
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/firebase';
import { toast } from 'react-hot-toast';

import { handleFirestoreError, OperationType } from '../services/api';

type FeedbackCategory = 'suggestion' | 'bug' | 'compliment' | 'other';

export const FeedbackPage = ({ language }: { language: 'en' | 'hi' }) => {
    const [category, setCategory] = useState<FeedbackCategory>('suggestion');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || rating === 0) {
            toast.error(language === 'en' ? 'Please provide a rating and message' : 'कृपया रेटिंग और संदेश प्रदान करें');
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                name,
                email,
                category,
                rating,
                message,
                language,
                status: 'new',
                createdAt: serverTimestamp()
            });
            setSubmitted(true);
            toast.success(language === 'en' ? 'Feedback submitted successfully!' : 'प्रतिक्रिया सफलतापूर्वक सबमिट की गई!');
        } catch (error) {
            console.error('Feedback submission failed:', error);
            toast.error(language === 'en' ? 'Failed to submit feedback' : 'प्रतिक्रिया सबमिट करने में विफल');
            handleFirestoreError(error, OperationType.CREATE, 'feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { id: 'suggestion', label: { en: 'Suggestion', hi: 'सुझाव' }, icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'bug', label: { en: 'Bug Report', hi: 'बग रिपोर्ट' }, icon: Bug, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 'compliment', label: { en: 'Compliment', hi: 'प्रशंसा' }, icon: ThumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'other', label: { en: 'Other', hi: 'अन्य' }, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl"
                >
                    <CheckCircle2 size={48} />
                </motion.div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                        {language === 'en' ? 'Thank You!' : 'धन्यवाद!'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
                        {language === 'en' 
                            ? 'Your feedback helps us build a better water intelligence platform for everyone.' 
                            : 'आपकी प्रतिक्रिया हमें सभी के लिए एक बेहतर जल खुफिया मंच बनाने में मदद करती है।'}
                    </p>
                </div>
                <button 
                    onClick={() => {
                        setSubmitted(false);
                        setMessage('');
                        setRating(0);
                        setName('');
                        setEmail('');
                    }}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                >
                    {language === 'en' ? 'Submit More Feedback' : 'अधिक प्रतिक्रिया सबमिट करें'}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
            {/* Info Side */}
            <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                        <Heart size={14} />
                        {language === 'en' ? 'Community Voice' : 'सामुदायिक आवाज'}
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-tight">
                        Help Us <span className="text-blue-600">Improve</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                        {language === 'en' 
                            ? 'We value your thoughts. Whether it is a feature request, a bug report, or just a friendly hello, we are all ears.' 
                            : 'हम आपके विचारों को महत्व देते हैं। चाहे वह फीचर अनुरोध हो, बग रिपोर्ट हो, या सिर्फ एक दोस्ताना नमस्ते, हम सब सुन रहे हैं।'}
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-subtle">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-2xl">
                            <Lightbulb size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Share Ideas</h4>
                            <p className="text-sm text-slate-500">Tell us what features you would like to see next.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-subtle">
                        <div className="p-3 bg-red-50 dark:bg-red-900/40 text-red-600 rounded-2xl">
                            <Bug size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Report Issues</h4>
                            <p className="text-sm text-slate-500">Found a glitch? Let us know so we can fix it.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-7">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Category Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Category</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id as any)}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                                            category === cat.id 
                                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl ${cat.bg} ${cat.color}`}>
                                            <cat.icon size={20} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${category === cat.id ? 'text-blue-600' : 'text-slate-500'}`}>
                                            {cat.label[language]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rate your experience</label>
                            <div className="flex gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star 
                                            size={32} 
                                            className={`${
                                                (hoverRating || rating) >= star 
                                                ? 'fill-amber-400 text-amber-400' 
                                                : 'text-slate-200 dark:text-slate-700'
                                            } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User size={12} /> Name (Optional)
                                </label>
                                <input 
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Mail size={12} /> Email (Optional)
                                </label>
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Message</label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={language === 'en' ? "Tell us more..." : "हमें और बताएं..."}
                                rows={5}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {language === 'en' ? 'Send Feedback' : 'प्रतिक्रिया भेजें'}
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};
