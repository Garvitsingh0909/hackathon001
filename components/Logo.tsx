import React from 'react';

export const Logo = ({ className = "", darkMode }: { className?: string, darkMode: boolean }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
        {/* Using a simplified representation of the provided logo concept */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path d="M50 5 C 20 5, 5 35, 5 50 C 5 65, 20 95, 50 95 C 80 95, 95 65, 95 50 C 95 35, 80 5, 50 5 Z" fill="url(#grad1)" />
          <circle cx="50" cy="50" r="20" fill="#0f172a" />
          <circle cx="50" cy="50" r="10" fill="#38bdf8" />
        </svg>
      </div>
      <span className={`text-xl font-bold font-display tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        Jal<span className="text-blue-500">Drishti</span> <span className="text-emerald-500">AI</span>
      </span>
    </div>
  );
};
