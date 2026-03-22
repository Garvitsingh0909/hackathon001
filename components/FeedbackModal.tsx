import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../src/firebase';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'en' | 'hi';
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, language }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !auth.currentUser) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userId: auth.currentUser.uid,
                email: auth.currentUser.email,
                message: message,
                timestamp: serverTimestamp()
            });
            setMessage('');
            onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-slate-300 dark:border-slate-600 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{language === 'en' ? 'Submit Feedback' : 'प्रतिक्रिया जमा करें'}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={language === 'en' ? "Tell us what you think or report an issue..." : "हमें बताएं कि आप क्या सोचते हैं या किसी समस्या की रिपोर्ट करें..."}
                        className="w-full h-40 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-md transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        {language === 'en' ? 'Send Feedback' : 'प्रतिक्रिया भेजें'}
                    </button>
                </form>
            </div>
        </div>
    );
};
