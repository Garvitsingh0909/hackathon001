import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBanner = () => {
  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-3 mb-5 text-sm text-slate-700 dark:text-slate-300">
      <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <span>
        <strong className="text-blue-700 dark:text-blue-400">Data Simulation Active:</strong>
        {" "}For demonstration purposes, some data points are simulated. 
        AI-based analysis is a preliminary screening tool.
      </span>
    </div>
  );
};
