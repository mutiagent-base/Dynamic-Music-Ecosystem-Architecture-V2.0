import React from 'react';
import { Youtube, Music, ExternalLink, RefreshCw, Share2, ShieldCheck } from 'lucide-react';
import { SongMetadata } from '../types';

interface AttributionHubProps {
  metadata: SongMetadata;
  onOpenExportModal: () => void;
}

export const AttributionHub: React.FC<AttributionHubProps> = ({
  metadata,
  onOpenExportModal
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Attribution & Ecosystem Integration Loop
          </h2>
        </div>

        <span className="text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
          Attribution Sync V2.0
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        PromptCraft Sonic Blueprint embeds full traceability and attribution between your Suno track, YouTube videos, and the Masterpiece Ground Truth database.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Suno Profile Link */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Suno Masterpiece Profile</h3>
              <p className="text-[11px] text-amber-400 font-mono">@arcprompt</p>
            </div>
          </div>

          <a
            href="https://suno.com/@arcprompt"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* YouTube Channel Link */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Video Tutorials & Guide</h3>
              <p className="text-[11px] text-red-400 font-mono">@PRODROCK99</p>
            </div>
          </div>

          <a
            href="https://youtube.com/@PRODROCK99"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={onOpenExportModal}
          className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>View Export Files (`.json` & `.txt`)</span>
        </button>
      </div>
    </div>
  );
};
