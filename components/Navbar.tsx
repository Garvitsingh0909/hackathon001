import React from 'react';
import { Droplets, Globe, Bell } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 h-16 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-900 p-2 rounded-lg shadow-sm">
            <Droplets className="text-white h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">JalDrishti AI</h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Governance Portal</span>
          </div>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors">
                <Globe size={14} />
                <span>EN</span>
            </button>

            {/* Notification */}
            <button className="relative p-2 text-slate-500 hover:text-blue-900 transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile */}
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white cursor-pointer">
                JD
            </div>
        </div>
      </div>
    </nav>
  );
};