import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Droplet, Activity, IndianRupee, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { DisclaimerBanner } from './ui/DisclaimerBanner';

export const WaterTools = ({ language }: { language: 'en' | 'hi' }) => {
  const [sidebarLang, setSidebarLang] = useState<'en' | 'hi'>(language);

  const explanations = {
    en: {
      title: "How to use these tools",
      tds: "TDS Blender: Mixes RO and Tap water to achieve ideal mineral levels (150-300 mg/L).",
      intake: "Daily Intake: Calculates recommended water intake based on weight, age, and activity level.",
      roi: "Filter ROI: Compares the cost of bottled water vs. a filter to show long-term savings."
    },
    hi: {
      title: "इन उपकरणों का उपयोग कैसे करें",
      tds: "टीडीएस ब्लेंडर: आदर्श खनिज स्तर (150-300 मिलीग्राम/लीटर) प्राप्त करने के लिए आरओ और नल के पानी को मिलाता है।",
      intake: "दैनिक सेवन: वजन, उम्र और गतिविधि स्तर के आधार पर अनुशंसित पानी के सेवन की गणना करता है।",
      roi: "फिल्टर आरओआई: दीर्घकालिक बचत दिखाने के लिए बोतलबंद पानी बनाम फिल्टर की लागत की तुलना करता है।"
    }
  };

  const content = explanations[sidebarLang];

  return (
    <div className="max-w-7xl mx-auto pt-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gov-card dark:bg-slate-900 rounded-[2rem] shadow-subtle dark:shadow-black/50 border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-4">{content.title}</h3>
          
          <div className="flex gap-2 mb-6">
            <button onClick={() => setSidebarLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold ${sidebarLang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>EN</button>
            <button onClick={() => setSidebarLang('hi')} className={`px-3 py-1 rounded-full text-xs font-bold ${sidebarLang === 'hi' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>HI</button>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <p><strong>TDS Blender:</strong> {content.tds}</p>
            <p><strong>Daily Intake:</strong> {content.intake}</p>
            <p><strong>Filter ROI:</strong> {content.roi}</p>
          </div>
        </div>
      </div>

      {/* Main Tools */}
      <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 space-y-8"
      >
        <DisclaimerBanner />
        <div className="bg-gov-card dark:bg-slate-900 rounded-[2rem] shadow-subtle dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          
          {/* Header */}
          <div className="p-8 md:p-10 border-b border-slate-200 dark:border-slate-800 bg-gov-bg dark:bg-slate-800/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-2xl">
                  <Calculator size={28} />
              </div>
              <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                    {language === 'en' ? 'Handy Water Tools' : 'उपयोगी जल उपकरण'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    {language === 'en' ? 'Quick calculators to help you make better choices about your water.' : 'आपके पानी के बारे में बेहतर विकल्प चुनने में मदद करने के लिए त्वरित कैलकुलेटर।'}
                  </p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-12">
            {/* Tool A: TDS Blending */}
            <TdsBlendingTool language={language} />
            
            <hr className="border-slate-200 dark:border-slate-800" />
            
            {/* Tool B: Daily Intake */}
            <DailyIntakeTool language={language} />
            
            <hr className="border-slate-200 dark:border-slate-800" />
            
            {/* Tool C: Filter ROI */}
            <FilterRoiTool language={language} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TdsBlendingTool = ({ language }: { language: 'en' | 'hi' }) => {
  const [source1, setSource1] = useState(50); // RO
  const [source2, setSource2] = useState(800); // Tap
  const [ratio, setRatio] = useState(70); // % of Source 1

  const blendedTds = Math.round((source1 * (ratio / 100)) + (source2 * ((100 - ratio) / 100)));
  const isIdeal = blendedTds >= 150 && blendedTds <= 300;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-subtle space-y-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-900/30 text-blue-400 rounded-2xl border border-blue-800/50"><Droplet size={28} /></div>
        <h3 className="text-2xl font-bold text-white font-display">
          {language === 'en' ? 'Mix It Up: TDS Blender' : 'इसे मिलाएं: टीडीएस ब्लेंडर'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {language === 'en' ? 'RO TDS' : 'आरओ टीडीएस'}
              </label>
              <input type="number" value={source1} onChange={e => setSource1(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {language === 'en' ? 'Tap TDS' : 'नल टीडीएस'}
              </label>
              <input type="number" value={source2} onChange={e => setSource2(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              {language === 'en' ? `Mix Ratio: ${ratio}% RO` : `मिश्रण अनुपात: ${ratio}% आरओ`}
            </label>
            <input type="range" min="10" max="90" value={ratio} onChange={e => setRatio(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
        </div>
        
        <div className={`p-6 rounded-[1.5rem] border flex flex-col justify-center ${isIdeal ? 'bg-emerald-950/30 border-emerald-800/50' : 'bg-amber-950/30 border-amber-800/50'}`}>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              {language === 'en' ? 'Blended TDS' : 'मिश्रित टीडीएस'}
            </p>
            <div className={`text-5xl font-bold font-mono mb-4 ${isIdeal ? 'text-emerald-400' : 'text-amber-400'}`}>
              ~{blendedTds} <span className="text-2xl font-sans">mg/L</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 font-bold text-sm">
              {isIdeal ? (
                <><CheckCircle className="text-emerald-500" size={16} /> <span className="text-emerald-400">{language === 'en' ? 'Looks Great!' : 'बहुत बढ़िया!'}</span></>
              ) : (
                <><AlertTriangle className="text-amber-500" size={16} /> <span className="text-amber-400">{language === 'en' ? 'Not Ideal (Aim for 150-300)' : 'आदर्श नहीं (150-300 का लक्ष्य रखें)'}</span></>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DailyIntakeTool = ({ language }: { language: 'en' | 'hi' }) => {
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(30);
  const [activity, setActivity] = useState('Active');
  const [tds, setTds] = useState(800);

  // Simple formula: Weight * 0.033 + (Activity == Active ? 0.5 : Athlete ? 1.0 : 0)
  const baseIntake = weight * 0.033;
  const activityBonus = activity === 'Active' ? 0.5 : activity === 'Athlete' ? 1.0 : 0;
  const recommendedIntake = (baseIntake + activityBonus).toFixed(1);
  
  const excessTds = Math.max(0, (tds - 300) * Number(recommendedIntake));

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-subtle space-y-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-900/30 text-blue-400 rounded-2xl border border-blue-800/50"><Activity size={28} /></div>
        <h3 className="text-2xl font-bold text-white font-display">
          {language === 'en' ? 'How Much Should You Drink?' : 'आपको कितना पीना चाहिए?'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {language === 'en' ? 'Weight (kg)' : 'वजन (किग्रा)'}
              </label>
              <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {language === 'en' ? 'Age' : 'उम्र'}
              </label>
              <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {language === 'en' ? 'Activity Level' : 'गतिविधि स्तर'}
              </label>
              <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono">
                <option value="Sedentary">{language === 'en' ? 'Chill' : 'शांत'}</option>
                <option value="Active">{language === 'en' ? 'Active' : 'सक्रिय'}</option>
                <option value="Athlete">{language === 'en' ? 'Super Active' : 'सुपर सक्रिय'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {language === 'en' ? "Water's TDS" : 'पानी का टीडीएस'}
              </label>
              <input type="number" value={tds} onChange={e => setTds(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" />
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border bg-slate-950 border-slate-800 flex flex-col justify-center space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <span className="font-bold text-slate-400 text-sm">
              {language === 'en' ? 'Recommended:' : 'अनुशंसित:'}
            </span>
            <span className="text-xl font-bold text-blue-400 font-mono">
              {recommendedIntake} {language === 'en' ? 'L/day' : 'लीटर/दिन'}
            </span>
          </div>
          
          <div className="pb-4 border-b border-slate-800">
            <span className="font-bold text-slate-400 text-xs uppercase tracking-wider block mb-2">
              {language === 'en' ? "Water Analysis" : 'पानी का विश्लेषण'}
            </span>
            {excessTds > 0 ? (
              <p className="text-red-400 text-sm font-medium">
                {language === 'en' 
                  ? `High TDS (${tds}). Extra ${Math.round(excessTds)}mg dissolved solids daily.` 
                  : `उच्च टीडीएस (${tds})। अतिरिक्त ${Math.round(excessTds)}mg घुली हुई चीजें प्रतिदिन।`}
              </p>
            ) : (
              <p className="text-emerald-400 text-sm font-medium">
                {language === 'en' ? "Water TDS is optimal." : 'पानी का टीडीएस इष्टतम है।'}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterRoiTool = ({ language }: { language: 'en' | 'hi' }) => {
  const [monthlySpend, setMonthlySpend] = useState(1500);
  const [filterCost, setFilterCost] = useState(12000);

  const breakEvenMonths = Math.ceil(filterCost / monthlySpend);
  const fiveYearSavings = (monthlySpend * 60) - filterCost;
  const bottlesSaved = Math.round((monthlySpend / 20) * 12); // Assuming ₹20 per bottle

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-subtle space-y-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-900/30 text-blue-400 rounded-2xl border border-blue-800/50"><IndianRupee size={28} /></div>
        <h3 className="text-2xl font-bold text-white font-display">
          {language === 'en' ? 'Is a Water Filter Worth It?' : 'क्या वाटर फिल्टर इसके लायक है?'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {language === 'en' ? 'Monthly Bottled Spend (₹)' : 'मासिक बोतलबंद खर्च (₹)'}
            </label>
            <input type="number" value={monthlySpend} onChange={e => setMonthlySpend(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {language === 'en' ? 'New Filter Cost (₹)' : 'नया फिल्टर लागत (₹)'}
            </label>
            <input type="number" value={filterCost} onChange={e => setFilterCost(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" />
          </div>
          
          <div className="pt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {language === 'en' ? "5-Year Cost Comparison" : '5-वर्षीय लागत तुलना'}
            </p>
            <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-red-900/50 flex items-center px-2 text-[10px] font-bold text-red-200" style={{ width: '100%' }}>
                {language === 'en' ? 'Bottled:' : 'बोतलबंद:'} ₹{monthlySpend * 60}
              </div>
            </div>
            <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden flex mt-2">
              <div className="h-full bg-emerald-900/50 flex items-center px-2 text-[10px] font-bold text-emerald-200" style={{ width: `${(filterCost / (monthlySpend * 60)) * 100}%`, minWidth: 'fit-content' }}>
                {language === 'en' ? 'Filter:' : 'फिल्टर:'} ₹{filterCost}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border bg-emerald-950/30 border-emerald-800/50 flex flex-col justify-center space-y-6">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
              {language === 'en' ? 'Break-even in' : 'इतने समय में वसूल'}
            </p>
            <p className="text-3xl font-bold font-mono text-emerald-300">
              {breakEvenMonths} <span className="text-sm font-sans">{language === 'en' ? 'Months' : 'महीने'}</span>
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
              {language === 'en' ? "5-Year Savings" : '5-वर्षीय बचत'}
            </p>
            <p className="text-3xl font-bold font-mono text-emerald-300">₹{fiveYearSavings.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
