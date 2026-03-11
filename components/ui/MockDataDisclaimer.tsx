import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const MockDataDisclaimer: React.FC = () => {
  return (
    <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 text-amber-800 dark:text-amber-200 p-3 mb-6 rounded-r-lg flex items-start gap-3 shadow-sm">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-bold mb-1">Mock Data Notice</p>
        <p>The data displayed on this page is for demonstration purposes only and does not represent real-time or actual sensor readings.</p>
      </div>
    </div>
  );
};

export const MockDataBadge: React.FC = () => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ml-2">
      MOCK DATA
    </span>
  );
};
