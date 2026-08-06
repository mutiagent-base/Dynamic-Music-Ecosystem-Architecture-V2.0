import React, { useState, useEffect } from 'react';
import { MASTERPIECE_PRESETS } from '../data/presets';
import { Preset, PillarState } from '../types';
import { User } from '../lib/firebase';
import {
  saveUserPreset,
  subscribeToUserPresets,
  deleteUserPreset,
} from '../lib/firestoreService';
import { Star, Zap, Play, Check, Plus, Cloud, Trash2 } from 'lucide-react';

interface PresetsLibraryProps {
  onSelectPreset: (preset: Preset) => void;
  activePresetId?: string;
  user: User | null;
  pillarState: PillarState;
}

export const PresetsLibrary: React.FC<PresetsLibraryProps> = ({
  onSelectPreset,
  activePresetId,
  user,
  pillarState,
}) => {
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [presetTitle, setPresetTitle] = useState('');
  const [presetDesc, setPresetDesc] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCustomPresets([]);
      return;
    }
    const unsubscribe = subscribeToUserPresets(user.uid, (presets) => {
      setCustomPresets(presets);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSaveCurrentAsPreset = async () => {
    if (!user) {
      setSaveStatus('Sign in to save custom presets.');
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    if (!presetTitle.trim()) return;

    try {
      await saveUserPreset(user.uid, {
        title: presetTitle.trim(),
        description: presetDesc.trim() || 'User custom Suno AI prompt matrix preset.',
        genre: pillarState.genre,
        instrumentation: pillarState.instrumentation,
        vocalStyle: pillarState.vocalStyle,
        productionPolish: pillarState.productionPolish,
        bpm: pillarState.bpm,
        musicalKey: pillarState.musicalKey,
        sampleLyrics: '[Verse 1]\nCustom preset sample lyrics...\n\n[Chorus]\nCustom preset chorus...',
        rating: 5.0,
      });

      setPresetTitle('');
      setPresetDesc('');
      setIsAdding(false);
      setSaveStatus('Preset saved to Firebase!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      console.error('Save preset error:', err);
      setSaveStatus('Error saving preset.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await deleteUserPreset(presetId);
    } catch (err) {
      console.error('Delete preset error:', err);
    }
  };

  const allPresets = [...MASTERPIECE_PRESETS, ...customPresets];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Title & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Masterpiece Prop Inventory
          </h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save Current Matrix</span>
        </button>
      </div>

      {saveStatus && (
        <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
          {saveStatus}
        </div>
      )}

      {/* Save Custom Preset Form */}
      {isAdding && (
        <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-xl space-y-2.5 animate-fadeIn">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span>Save Current 4-Pillar Config to Firebase</span>
          </h3>
          <input
            type="text"
            placeholder="Preset Name (e.g. My Heavy Cyber Synth)"
            value={presetTitle}
            onChange={(e) => setPresetTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            placeholder="Description (Optional)"
            value={presetDesc}
            onChange={(e) => setPresetDesc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCurrentAsPreset}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              Save to Firestore
            </button>
          </div>
        </div>
      )}

      {/* Preset List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {allPresets.map((preset) => {
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
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span>{preset.title}</span>
                    {preset.isCustom && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono">
                        Cloud
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{preset.rating || 5.0}</span>
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

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectPreset(preset)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Loaded</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-blue-400" />
                      <span>Load</span>
                    </>
                  )}
                </button>

                {preset.isCustom && (
                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-lg transition-all"
                    title="Delete Custom Preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
