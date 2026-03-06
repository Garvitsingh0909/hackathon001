import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Droplet, Activity, IndianRupee, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

export const WaterTools = () => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto pt-6 space-y-8"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-2xl">
                <Calculator size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Water Calculators</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Smart tools for everyday water decisions</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-12">
          {/* Tool A: TDS Blending */}
          <TdsBlendingTool />
          
          <hr className="border-slate-100 dark:border-slate-800" />
          
          {/* Tool B: Daily Intake */}
          <DailyIntakeTool />
          
          <hr className="border-slate-100 dark:border-slate-800" />
          
          {/* Tool C: Filter ROI */}
          <FilterRoiTool />
        </div>
      </div>
    </motion.div>
  );
};

const TdsBlendingTool = () => {
  const [source1, setSource1] = useState(50); // RO
  const [source2, setSource2] = useState(800); // Tap
  const [ratio, setRatio] = useState(70); // % of Source 1

  const blendedTds = Math.round((source1 * (ratio / 100)) + (source2 * ((100 - ratio) / 100)));
  const isIdeal = blendedTds >= 150 && blendedTds <= 300;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Droplet size={24} /></div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display">TDS Blending Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Source 1 TDS (RO)</label>
              <input type="number" value={source1} onChange={e => setSource1(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Source 2 TDS (Tap)</label>
              <input type="number" value={source2} onChange={e => setSource2(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Mixing Ratio: {ratio}% RO / {100 - ratio}% Tap</label>
            <input type="range" min="10" max="90" value={ratio} onChange={e => setRatio(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl border flex flex-col justify-center ${isIdeal ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'}`}>
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Resulting TDS</p>
            <div className={`text-5xl font-bold font-display mb-4 ${isIdeal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              ~{blendedTds} <span className="text-2xl">mg/L</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 font-bold text-lg">
              {isIdeal ? (
                <><CheckCircle className="text-emerald-500" /> <span className="text-emerald-700 dark:text-emerald-400">Ideal Range</span></>
              ) : (
                <><AlertTriangle className="text-amber-500" /> <span className="text-amber-700 dark:text-amber-400">Not Ideal (Aim for 150-300)</span></>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Pure RO water (TDS &lt;50) lacks minerals — blending improves taste & health.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DailyIntakeTool = () => {
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
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Daily Intake Quality Checker</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Age</label>
              <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Activity Level</label>
              <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                <option>Sedentary</option>
                <option>Active</option>
                <option>Athlete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current TDS</label>
              <input type="number" value={tds} onChange={e => setTds(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col justify-center space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-600 dark:text-slate-400">Recommended Intake:</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{recommendedIntake} Litres/day</span>
          </div>
          
          <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-600 dark:text-slate-400 block mb-2">TDS Assessment:</span>
            {excessTds > 0 ? (
              <p className="text-red-600 dark:text-red-400 font-medium">Your water is at {tds} TDS — you're consuming ~{Math.round(excessTds)}mg excess dissolved solids daily.</p>
            ) : (
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">Your water TDS is within healthy limits for your daily intake.</p>
            )}
          </div>
          
          <div>
            <span className="font-bold text-slate-600 dark:text-slate-400 block mb-2">Recommendation:</span>
            {excessTds > 0 ? (
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                Switch to RO or blend. Long-term risk of high TDS intake includes kidney stones and scale buildup.
              </p>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                Continue current water source. Ensure regular filter maintenance.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterRoiTool = () => {
  const [monthlySpend, setMonthlySpend] = useState(1500);
  const [filterCost, setFilterCost] = useState(12000);

  const breakEvenMonths = Math.ceil(filterCost / monthlySpend);
  const fiveYearSavings = (monthlySpend * 60) - filterCost;
  const bottlesSaved = Math.round((monthlySpend / 20) * 12); // Assuming ₹20 per bottle

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><IndianRupee size={24} /></div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Filter ROI Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monthly Bottled Water Spend (₹)</label>
            <input type="number" value={monthlySpend} onChange={e => setMonthlySpend(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Estimated RO Filter Cost (₹)</label>
            <input type="number" value={filterCost} onChange={e => setFilterCost(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>
          
          <div className="pt-4">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Cost Comparison (5 Years)</p>
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-red-400 flex items-center px-2 text-xs font-bold text-white" style={{ width: '100%' }}>Bottled: ₹{monthlySpend * 60}</div>
            </div>
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mt-2">
              <div className="h-full bg-emerald-500 flex items-center px-2 text-xs font-bold text-white" style={{ width: `${(filterCost / (monthlySpend * 60)) * 100}%`, minWidth: 'fit-content' }}>Filter: ₹{filterCost}</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 flex flex-col justify-center space-y-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Break-even Point</p>
            <p className="text-3xl font-bold font-display text-emerald-700 dark:text-emerald-300">{breakEvenMonths} Months</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">5-Year Savings</p>
            <p className="text-3xl font-bold font-display text-emerald-700 dark:text-emerald-300">₹{fiveYearSavings.toLocaleString()}</p>
          </div>
          
          <div className="text-center pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
            <p className="text-emerald-800 dark:text-emerald-200 font-medium">
              You'll avoid ~<span className="font-bold">{bottlesSaved}</span> plastic bottles/year 🌱
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
