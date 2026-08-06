import React, { useState } from 'react';
import { Youtube, Music, ExternalLink, RefreshCw, Share2, Copy, Check, Sparkles } from 'lucide-react';
import { SongMetadata } from '../types';

interface AttributionHubProps {
  metadata: SongMetadata;
  onOpenExportModal: () => void;
}

export const AttributionHub: React.FC<AttributionHubProps> = ({
  metadata,
  onOpenExportModal
}) => {
  const [showShareCard, setShowShareCard] = useState(false);
  const [copied, setCopied] = useState(false);

  // Formatted social media snippet generator
  const socialSnippet = `🎵 "${metadata.title}" — AI Song Blueprint

✨ Genre: ${metadata.genreVibe || 'Custom AI Vibe'}
🎛️ Tempo: ${metadata.bpm} BPM | Key: ${metadata.musicalKey}
🔥 Style Prompt: ${metadata.stylePrompt || 'Custom 4-Pillar Architecture'}

🎧 Created with PromptCraft Sonic Blueprint V2.0
📌 Suno Profile: https://suno.com/@arcprompt (${metadata.attribution.sunoProfile || '@arcprompt'})
📌 YouTube Channel: https://youtube.com/@PRODROCK99 (${metadata.attribution.youtubeChannel || '@PRODROCK99'})

#SunoAI #AIMusic #PromptCraft #MusicProduction #SonicBlueprint`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(socialSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialSnippet)}`;

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

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
        <button
          onClick={() => setShowShareCard(!showShareCard)}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
            showShareCard
              ? 'bg-cyan-600 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{showShareCard ? 'Hide Social Snippet' : 'Share Social Snippet'}</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>View Export Files (`.json` & `.txt`)</span>
        </button>
      </div>

      {/* Social Media Snippet Card */}
      {showShareCard && (
        <div className="p-4 bg-slate-950/90 rounded-xl border border-cyan-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Social Media Ready Snippet (X / Discord / Instagram / TikTok)</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={tweetIntentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-700"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Post on X</span>
              </a>

              <button
                onClick={handleCopySnippet}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3 h-3 text-slate-950" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>
          </div>

          <pre className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap select-all max-h-48 overflow-y-auto">
            {socialSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
