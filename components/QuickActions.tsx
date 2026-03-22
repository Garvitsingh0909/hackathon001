import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, MapPin, MessageSquare, X, Droplets } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface QuickActionsProps {
    onAction: (tab: string) => void;
    language: 'en' | 'hi';
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction, language }) => {
    const t = TRANSLATIONS[language].nav;
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { id: 'analyze', icon: Camera, label: t.analyze, color: 'bg-blue-500' },
        { id: 'intel', icon: Droplets, label: t.intel, color: 'bg-emerald-500' },
        { id: 'map', icon: MapPin, label: t.map, color: 'bg-amber-500' },
        { id: 'guide', icon: MessageSquare, label: language === 'en' ? 'Starter Guide' : 'स्टार्टर गाइड', color: 'bg-purple-500' },
    ];

    const handleAction = (id: string) => {
        if (id === 'guide') {
            document.dispatchEvent(new CustomEvent('open-starter-guide'));
        } else {
            onAction(id);
        }
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col items-end gap-3 mb-2">
                        {actions.map((action, index) => (
                            <motion.button
                                key={action.id}
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleAction(action.id)}
                                className="flex items-center gap-3 group"
                            >
                                <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 dark:border-slate-700">
                                    {action.label}
                                </span>
                                <div className={`${action.color} p-3 rounded-[1.5rem] text-white shadow-md hover:shadow-lg hover:scale-110 transition-all`}>
                                    <action.icon size={20} />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? 'bg-slate-800 dark:bg-slate-700' : 'bg-gov-navy'} p-4 rounded-[1.5rem] text-white shadow-lg hover:shadow-xl z-50 transition-all`}
            >
                {isOpen ? <X size={24} /> : <Plus size={24} />}
            </motion.button>
        </div>
    );
};
