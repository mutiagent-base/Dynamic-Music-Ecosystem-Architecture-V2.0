import React from 'react';
import { MASTERPIECE_PRESETS } from '../data/presets';
import { Preset, PillarState, SongMetadata } from '../types';
import { Star, Zap, Bookmark, Play, Check } from 'lucide-react';

interface PresetsLibraryProps {
  onSelectPreset: (preset: Preset) => void;
  activePresetId?: string;
}

export const PresetsLibrary: React.FC<PresetsLibraryProps> = ({
  onSelectPreset,
  activePresetId
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Masterpiece Prop Inventory (Ground Truth DB)
          </h2>
        </div>
        <span className="text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-semibold">
          4 Curated Presets
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MASTERPIECE_PRESETS.map(preset => {
          const isActive = activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between gap-3 ${
                isActive
                  ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{preset.title}</span>
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{preset.rating}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2.5">
                  {preset.description}
                </p>

                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">
                    {preset.bpm} BPM
                  </span>
                  <span className="bg-slate-800 text-purple-300 px-2 py-0.5 rounded">
                    {preset.musicalKey}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectPreset(preset)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isActive ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Preset Loaded</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-blue-400" />
                    <span>Load Preset</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
