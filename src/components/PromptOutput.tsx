import React, { useState } from 'react';
import { PillarState } from '../types';
import { assembleStylePrompt } from '../utils/promptEngine';
import { MUSICAL_KEYS } from '../data/pillars';
import { Copy, Check, Wand2, AlertTriangle, Music, Sliders, ShieldCheck } from 'lucide-react';

interface PromptOutputProps {
  pillarState: PillarState;
  setPillarState: React.Dispatch<React.SetStateAction<PillarState>>;
  onCopyStylePrompt: (text: string) => void;
}

export const PromptOutput: React.FC<PromptOutputProps> = ({
  pillarState,
  setPillarState,
  onCopyStylePrompt
}) => {
  const [copied, setCopied] = useState(false);

  const assembled = assembleStylePrompt(pillarState);

  const handleCopy = () => {
    onCopyStylePrompt(assembled.sanitizedStylePrompt);
    navigator.clipboard.writeText(assembled.sanitizedStylePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoEnhanceToggle = () => {
    setPillarState(prev => ({
      ...prev,
      autoEnhanced: !prev.autoEnhanced
    }));
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Suno Style Tag Master Output
          </h2>
        </div>

        {/* Auto Enhance Toggle Button */}
        <button
          onClick={handleAutoEnhanceToggle}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
            pillarState.autoEnhanced
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Sonic Polish Auto-Enhance</span>
        </button>
      </div>

      {/* Main Prompt Textbox Box */}
      <div className="relative bg-slate-950/80 rounded-xl p-4 border border-slate-800/90 font-mono text-sm text-cyan-300">
        <p className="pr-12 break-words leading-relaxed min-h-[44px]">
          {assembled.sanitizedStylePrompt || (
            <span className="text-slate-600 italic">
              Select pillars above or load a preset to generate Suno style prompt...
            </span>
          )}
        </p>

        <button
          onClick={handleCopy}
          disabled={!assembled.sanitizedStylePrompt}
          className="absolute top-3 right-3 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Copy Style Prompt to Clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Character Count Bar (Suno 120 character constraint) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-400 flex items-center gap-1">
            <span>Suno Style Tag Constraint</span>
            {assembled.isOverLimit ? (
              <span className="text-red-400 font-bold flex items-center gap-1 ml-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Exceeds 120 chars! Trim tags.
              </span>
            ) : (
              <span className="text-emerald-400 font-bold ml-2">
                Optimal Length
              </span>
            )}
          </span>
          <span className={`font-mono font-bold ${assembled.isOverLimit ? 'text-red-400' : 'text-slate-300'}`}>
            {assembled.charCount} / 120 chars
          </span>
        </div>

        {/* Meter progress bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              assembled.isOverLimit
                ? 'bg-red-500'
                : assembled.charCount > 100
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${Math.min((assembled.charCount / 120) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Musical Parameters Controls: BPM & Key */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
        
        {/* BPM Selector */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Tempo (BPM)</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="60"
              max="180"
              value={pillarState.bpm}
              onChange={e => setPillarState(prev => ({ ...prev, bpm: Number(e.target.value) }))}
              className="w-24 accent-blue-500"
            />
            <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded">
              {pillarState.bpm}
            </span>
          </div>
        </div>

        {/* Musical Key Selector */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Music className="w-4 h-4 text-purple-400" />
            <span>Musical Key</span>
          </div>

          <select
            value={pillarState.musicalKey}
            onChange={e => setPillarState(prev => ({ ...prev, musicalKey: e.target.value }))}
            className="bg-slate-800 text-xs font-bold text-white px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
          >
            {MUSICAL_KEYS.map(key => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
};
