import React from 'react';
import { Sparkles, ShieldCheck, Database, Youtube, Music, Github, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="h-full w-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <Layers className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">PromptCraft Sonic Blueprint</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                V2.0 Core
              </span>
            </div>
            <p className="text-xs text-slate-400">4-Pillar Suno AI Music Prompt Engine & Song Metadata Generator</p>
          </div>
        </div>

        {/* System Health Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>4-Pillar Engine</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-cyan-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Guardrails Active</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-purple-400 font-medium">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Ground Truth Sync</span>
          </div>
        </div>

        {/* Ecosystem Attribution Links */}
        <div className="flex items-center gap-2">
          <a
            href="https://youtube.com/@PRODROCK99"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold transition-colors"
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>@PRODROCK99</span>
          </a>

          <a
            href="https://suno.com/@arcprompt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold transition-colors"
          >
            <Music className="w-3.5 h-3.5" />
            <span>@arcprompt</span>
          </a>

          <a
            href="https://github.com/mutiagent-base/promptcraft-sonic-blueprint"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>

      </div>
    </header>
  );
};
