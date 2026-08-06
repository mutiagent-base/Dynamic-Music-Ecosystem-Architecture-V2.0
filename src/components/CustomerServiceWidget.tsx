import React from 'react';
import { Headphones, Sparkles } from 'lucide-react';

interface CustomerServiceWidgetProps {
  onOpenModal: () => void;
}

export const CustomerServiceWidget: React.FC<CustomerServiceWidgetProps> = ({ onOpenModal }) => {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={onOpenModal}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 font-black rounded-full shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all border border-cyan-300/40"
        title="Open Real-Time Exceptional Customer Service Concierge"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>

        <Headphones className="w-5 h-5 text-slate-950" />
        
        <span className="text-xs font-black uppercase tracking-wider hidden sm:inline-block">
          24/7 Live Support
        </span>

        <Sparkles className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};
