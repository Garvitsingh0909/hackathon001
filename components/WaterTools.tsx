import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Droplet, Activity, IndianRupee, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

export const WaterTools = ({ language }: { language: 'en' | 'hi' }) => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto pt-6 space-y-8"
    >
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
  );
};

const TdsBlendingTool = ({ language }: { language: 'en' | 'hi' }) => {
  const [source1, setSource1] = useState(50); // RO
  const [source2, setSource2] = useState(800); // Tap
  const [ratio, setRatio] = useState(70); // % of Source 1

  const blendedTds = Math.round((source1 * (ratio / 100)) + (source2 * ((100 - ratio) / 100)));
  const isIdeal = blendedTds >= 150 && blendedTds <= 300;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Droplet size={24} /></div>
        <h3 className="text-2xl font-bold text-gov-navy dark:text-white font-display">
          {language === 'en' ? 'Mix It Up: TDS Blender' : 'इसे मिलाएं: टीडीएस ब्लेंडर'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'en' ? 'Your RO Water TDS' : 'आपका आरओ पानी टीडीएस'}
              </label>
              <input type="number" value={source1} onChange={e => setSource1(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'en' ? 'Your Tap Water TDS' : 'आपका नल का पानी टीडीएस'}
              </label>
              <input type="number" value={source2} onChange={e => setSource2(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
              {language === 'en' ? `How much of each? ${ratio}% RO / ${100 - ratio}% Tap` : `प्रत्येक का कितना? ${ratio}% आरओ / ${100 - ratio}% नल`}
            </label>
            <input type="range" min="10" max="90" value={ratio} onChange={e => setRatio(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl border flex flex-col justify-center ${isIdeal ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'}`}>
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {language === 'en' ? 'Your Mixed Water TDS' : 'आपका मिश्रित पानी टीडीएस'}
            </p>
            <div className={`text-5xl font-bold font-display mb-4 ${isIdeal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              ~{blendedTds} <span className="text-2xl">mg/L</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 font-bold text-lg">
              {isIdeal ? (
                <><CheckCircle className="text-emerald-500" /> <span className="text-emerald-700 dark:text-emerald-400">{language === 'en' ? 'Looks Great!' : 'बहुत बढ़िया!'}</span></>
              ) : (
                <><AlertTriangle className="text-amber-500" /> <span className="text-amber-700 dark:text-amber-400">{language === 'en' ? 'Not Ideal (Aim for 150-300)' : 'आदर्श नहीं (150-300 का लक्ष्य रखें)'}</span></>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'en' ? 'Super pure RO water (under 50 TDS) is actually missing good minerals. Mixing in a little tap water makes it healthier and tastier!' : 'सुपर शुद्ध आरओ पानी (50 टीडीएस से कम) में वास्तव में अच्छे खनिजों की कमी होती है। थोड़ा नल का पानी मिलाने से यह स्वस्थ और स्वादिष्ट हो जाता है!'}
            </p>
          </div>
        </div>
      </div>
    </div>
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Activity size={24} /></div>
        <h3 className="text-2xl font-bold text-gov-navy dark:text-white font-display">
          {language === 'en' ? 'How Much Should You Drink?' : 'आपको कितना पीना चाहिए?'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'en' ? 'Your Weight (kg)' : 'आपका वजन (किग्रा)'}
              </label>
              <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'en' ? 'Your Age' : 'आपकी उम्र'}
              </label>
              <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'en' ? 'How active are you?' : 'आप कितने सक्रिय हैं?'}
              </label>
              <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                <option value="Sedentary">{language === 'en' ? 'Chill (Not very active)' : 'शांत (बहुत सक्रिय नहीं)'}</option>
                <option value="Active">{language === 'en' ? 'Active (I move around a bit)' : 'सक्रिय (मैं थोड़ा घूमता हूँ)'}</option>
                <option value="Athlete">{language === 'en' ? 'Super Active (I work out a lot)' : 'सुपर सक्रिय (मैं बहुत कसरत करता हूँ)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'en' ? "Your Water's TDS" : 'आपके पानी का टीडीएस'}
              </label>
              <input type="number" value={tds} onChange={e => setTds(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col justify-center space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {language === 'en' ? 'You should drink about:' : 'आपको लगभग पीना चाहिए:'}
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {recommendedIntake} {language === 'en' ? 'Litres/day' : 'लीटर/दिन'}
            </span>
          </div>
          
          <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-600 dark:text-slate-400 block mb-2">
              {language === 'en' ? "What's in your water?" : 'आपके पानी में क्या है?'}
            </span>
            {excessTds > 0 ? (
              <p className="text-red-600 dark:text-red-400 font-medium">
                {language === 'en' 
                  ? `Your water has ${tds} TDS. You're taking in about ${Math.round(excessTds)}mg of extra dissolved stuff every day.` 
                  : `आपके पानी में ${tds} टीडीएस है। आप हर दिन लगभग ${Math.round(excessTds)}mg अतिरिक्त घुली हुई चीजें ले रहे हैं।`}
              </p>
            ) : (
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                {language === 'en' ? "Your water's TDS looks great for how much you drink!" : 'आप जितना पीते हैं उसके लिए आपके पानी का टीडीएस बहुत अच्छा लगता है!'}
              </p>
            )}
          </div>
          
          <div>
            <span className="font-bold text-slate-600 dark:text-slate-400 block mb-2">
              {language === 'en' ? 'Our Advice:' : 'हमारी सलाह:'}
            </span>
            {excessTds > 0 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                {language === 'en' 
                  ? 'You might want to switch to an RO filter or mix your water. Drinking high TDS water for a long time can lead to kidney stones.' 
                  : 'आप आरओ फिल्टर पर स्विच करना चाह सकते हैं या अपने पानी को मिला सकते हैं। लंबे समय तक उच्च टीडीएस वाला पानी पीने से गुर्दे की पथरी हो सकती है।'}
              </p>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                {language === 'en' 
                  ? "Keep doing what you're doing! Just remember to change your filters when needed." 
                  : 'आप जो कर रहे हैं उसे करते रहें! बस जरूरत पड़ने पर अपने फिल्टर बदलना याद रखें।'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterRoiTool = ({ language }: { language: 'en' | 'hi' }) => {
  const [monthlySpend, setMonthlySpend] = useState(1500);
  const [filterCost, setFilterCost] = useState(12000);

  const breakEvenMonths = Math.ceil(filterCost / monthlySpend);
  const fiveYearSavings = (monthlySpend * 60) - filterCost;
  const bottlesSaved = Math.round((monthlySpend / 20) * 12); // Assuming ₹20 per bottle

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><IndianRupee size={24} /></div>
        <h3 className="text-2xl font-bold text-gov-navy dark:text-white font-display">
          {language === 'en' ? 'Is a Water Filter Worth It?' : 'क्या वाटर फिल्टर इसके लायक है?'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              {language === 'en' ? 'How much do you spend on bottled water a month? (₹)' : 'आप एक महीने में बोतलबंद पानी पर कितना खर्च करते हैं? (₹)'}
            </label>
            <input type="number" value={monthlySpend} onChange={e => setMonthlySpend(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              {language === 'en' ? 'How much does a new water filter cost? (₹)' : 'एक नए वाटर फिल्टर की कीमत कितनी है? (₹)'}
            </label>
            <input type="number" value={filterCost} onChange={e => setFilterCost(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>
          
          <div className="pt-4">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
              {language === 'en' ? "Let's look at the next 5 years" : 'आइए अगले 5 वर्षों को देखें'}
            </p>
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-red-400 flex items-center px-2 text-xs font-bold text-white" style={{ width: '100%' }}>
                {language === 'en' ? 'Bottled:' : 'बोतलबंद:'} ₹{monthlySpend * 60}
              </div>
            </div>
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mt-2">
              <div className="h-full bg-emerald-500 flex items-center px-2 text-xs font-bold text-white" style={{ width: `${(filterCost / (monthlySpend * 60)) * 100}%`, minWidth: 'fit-content' }}>
                {language === 'en' ? 'Filter:' : 'फिल्टर:'} ₹{filterCost}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 flex flex-col justify-center space-y-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              {language === 'en' ? 'It pays for itself in' : 'यह इतने समय में अपनी कीमत वसूल कर लेता है'}
            </p>
            <p className="text-3xl font-bold font-display text-emerald-700 dark:text-emerald-300">
              {breakEvenMonths} {language === 'en' ? 'Months' : 'महीने'}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              {language === 'en' ? "You'll save this much in 5 years" : 'आप 5 वर्षों में इतना बचाएंगे'}
            </p>
            <p className="text-3xl font-bold font-display text-emerald-700 dark:text-emerald-300">₹{fiveYearSavings.toLocaleString()}</p>
          </div>
          
          <div className="text-center pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
            <p className="text-emerald-800 dark:text-emerald-200 font-medium">
              {language === 'en' 
                ? <>Plus, you'll save around <span className="font-bold">{bottlesSaved}</span> plastic bottles from the trash every year! 🌱</> 
                : <>साथ ही, आप हर साल लगभग <span className="font-bold">{bottlesSaved}</span> प्लास्टिक की बोतलों को कचरे में जाने से बचाएंगे! 🌱</>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
