import React, { useState } from 'react';
import { SongMetadata, PillarState } from '../types';
import { assembleStylePrompt } from '../utils/promptEngine';
import { FileText, Copy, Check, Download, Music2, Tag, Info, Sparkles } from 'lucide-react';

interface SongMetadataEditorProps {
  metadata: SongMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<SongMetadata>>;
  pillarState: PillarState;
  onOpenExportModal: () => void;
}

export const SongMetadataEditor: React.FC<SongMetadataEditorProps> = ({
  metadata,
  setMetadata,
  pillarState,
  onOpenExportModal
}) => {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);

  const assembled = assembleStylePrompt(pillarState);

  const handleInsertStructureTag = (tag: string) => {
    setMetadata(prev => ({
      ...prev,
      lyrics: prev.lyrics ? `${prev.lyrics}\n\n${tag}\n` : `${tag}\n`
    }));
  };

  const copyToClipboard = (text: string, setCopiedFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Song Metadata & Lyrics Architecture
          </h2>
        </div>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON & YouTube Data</span>
        </button>
      </div>

      {/* Song Title & Concept */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Song Title</span>
            <button
              onClick={() => copyToClipboard(metadata.title, setCopiedTitle)}
              className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1"
            >
              {copiedTitle ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy Title</span>
            </button>
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Neon Cyberpunk Horizon 2088"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-semibold"
          />
        </div>

        {/* Concept */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Concept / Narrative Vibe
          </label>
          <input
            type="text"
            value={metadata.concept}
            onChange={e => setMetadata(prev => ({ ...prev, concept: e.target.value }))}
            placeholder="e.g. Retro-futuristic story of midnight circuits and artificial memories"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

      </div>

      {/* Lyrics & Structural Section Tags */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Music2 className="w-4 h-4 text-purple-400" />
            <span>Suno Lyrics & Structural Tags (`[Verse]`, `[Chorus]`, etc.)</span>
          </label>

          <button
            onClick={() => copyToClipboard(metadata.lyrics, setCopiedLyrics)}
            className="text-xs font-medium px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-lg flex items-center gap-1 transition-colors"
          >
            {copiedLyrics ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Lyrics</span>
          </button>
        </div>

        {/* Quick Insert Buttons for Section Brackets */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Insert Bracket Tag:</span>
          {['[Intro]', '[Verse 1]', '[Pre-Chorus]', '[Chorus]', '[Bridge]', '[Guitar Solo]', '[Outro]', '[Fade Out]'].map(tag => (
            <button
              key={tag}
              onClick={() => handleInsertStructureTag(tag)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] rounded-md transition-colors border border-slate-700"
            >
              + {tag}
            </button>
          ))}
        </div>

        <textarea
          rows={10}
          value={metadata.lyrics}
          onChange={e => setMetadata(prev => ({ ...prev, lyrics: e.target.value }))}
          placeholder="Paste or write lyrics with section tags...&#10;&#10;[Verse 1]&#10;Midnight circuits glowing bright...&#10;&#10;[Chorus]&#10;We are neon shadows dancing in the code..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed"
        />
      </div>

    </div>
  );
};
