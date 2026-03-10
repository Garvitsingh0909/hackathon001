import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

const faqs = [
  {
    q: "How often should I test my water?",
    a: "Test every 6 months for borewell water, annually for municipal. Always test after floods or pipeline work nearby."
  },
  {
    q: "What is a safe TDS level for drinking water?",
    a: "BIS recommends below 500 mg/L. Below 300 is ideal. Above 1200 is undrinkable. Pure RO water (TDS < 50) should be blended."
  },
  {
    q: "Is hard water dangerous?",
    a: "Hard water (high calcium/magnesium) is not immediately dangerous but causes kidney stones with long-term use, scale buildup in pipes, dry skin, and poor soap lathering."
  },
  {
    q: "Can I drink water that smells of chlorine?",
    a: "Mild chlorine smell is normal and means the water is disinfected. Strong smell means excess chlorine — use an activated carbon filter or let water sit in an open vessel for 30 minutes."
  },
  {
    q: "What is the safest water for infants?",
    a: "Always use RO+UV purified water for infants under 12 months. TDS should be 50–150 mg/L. Boil even after purifying for extra safety."
  },
  {
    q: "Is RO water healthy long-term?",
    a: "Pure RO water (TDS < 50) lacks minerals and tastes flat. Long-term use may cause mineral deficiency. Always blend: 70% RO + 30% tap to achieve TDS 150–200."
  },
  {
    q: "How do I clean my water storage tank?",
    a: "Empty tank fully → scrub walls with stiff brush + diluted bleach (1 tsp per 10L water) → rinse 3 times → refill. Do this every 6 months. Never store water longer than 24–48 hours."
  },
  {
    q: "What is Jal Jeevan Mission?",
    a: "Government of India scheme to provide tap water to every rural household by 2024. Free tap connection for BPL families. Check eligibility at jaljeevanmission.gov.in"
  },
  {
    q: "How do I get free water testing?",
    a: "Visit your nearest PHC (Primary Health Centre) or CGWB office. In rural areas, Jal Jeevan Mission provides free testing kits. Call CGWB helpline: 1800-180-1551 (free)"
  },
  {
    q: "Does boiling water remove TDS?",
    a: "No. Boiling only kills bacteria and viruses — it does NOT reduce TDS or remove chemicals. Boiling actually slightly increases TDS as water evaporates. For high TDS, you need an RO filter."
  }
];

export const WaterFAQ = ({ onAskAI }: { onAskAI: (question: string) => void }) => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto pt-6"
    >
      <div className="bg-gov-card dark:bg-slate-900 rounded-[2rem] shadow-subtle dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 dark:border-slate-800 bg-gov-bg dark:bg-slate-800/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-2xl">
                <HelpCircle size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-gov-navy dark:text-white font-display">Water Safety FAQs</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Common questions about water quality in India</p>
            </div>
          </div>
          
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gov-card dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-subtle"
            />
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="space-y-4 max-w-3xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                No FAQs found matching your search.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-gov-card dark:bg-slate-800 hover:shadow-subtle-hover transition-shadow">
                  <button 
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 pr-8">{faq.q}</span>
                    {expanded === idx ? <ChevronUp size={20} className="text-blue-500 shrink-0" /> : <ChevronDown size={20} className="text-slate-400 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {expanded === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4"
                      >
                        <p className="mb-4">{faq.a}</p>
                        <button 
                          onClick={() => onAskAI(faq.q)}
                          className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg"
                        >
                          <MessageSquare size={16} /> Ask AI about this
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
