import React, { useState } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../src/firebase';

export const FeedbackPage: React.FC = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-subtle border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                    <MessageSquare size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send Us Your Feedback</h2>
            </div>
            
            {success ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-2xl font-bold text-center">
                    Thank you for your feedback!
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what you think or report an issue..."
                        className="w-full h-64 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-md transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        Send Feedback
                    </button>
                </form>
            )}
        </div>
    );
};
