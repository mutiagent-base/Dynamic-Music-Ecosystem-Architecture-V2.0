import React, { useState, useEffect, useRef } from 'react';
import {
  GENRE_HERITAGE_OPTIONS,
  INSTRUMENTATION_OPTIONS,
  VOCAL_STYLE_OPTIONS,
  PRODUCTION_POLISH_OPTIONS
} from '../data/pillars';
import { PillarState } from '../types';
import { Disc, Guitar, Mic2, Sparkles, Plus, Check, Undo2, Redo2 } from 'lucide-react';

interface PillarSelectorProps {
  pillarState: PillarState;
  setPillarState: React.Dispatch<React.SetStateAction<PillarState>>;
}

export const PillarSelector: React.FC<PillarSelectorProps> = ({
  pillarState,
  setPillarState
}) => {
  const [activeTab, setActiveTab] = useState<'genre' | 'instrument' | 'vocal' | 'polish'>('genre');

  // Undo / Redo History Stack
  const [history, setHistory] = useState<PillarState[]>([pillarState]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoAction = useRef<boolean>(false);

  // Sync changes to history stack
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    const currentHistoryState = history[historyIndex];
    if (JSON.stringify(pillarState) !== JSON.stringify(currentHistoryState)) {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push(pillarState);
      if (updatedHistory.length > 50) updatedHistory.shift();
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    }
  }, [pillarState]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      isUndoRedoAction.current = true;
      setHistoryIndex(prevIdx);
      setPillarState(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      isUndoRedoAction.current = true;
      setHistoryIndex(nextIdx);
      setPillarState(history[nextIdx]);
    }
  };

  const toggleTag = (category: keyof PillarState, tag: string) => {
    if (!Array.isArray(pillarState[category])) return;
    
    const currentList = pillarState[category] as string[];
    const exists = currentList.includes(tag);
    const updated = exists
      ? currentList.filter(item => item !== tag)
      : [...currentList, tag];

    setPillarState(prev => ({
      ...prev,
      [category]: updated
    }));
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800">
      
      {/* Header Tabs & Undo/Redo Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4-Pillar Prompt Matrix
            </h2>
          </div>

          {/* Undo / Redo Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1 px-2.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300"
              title="Undo design change"
            >
              <Undo2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Undo</span>
            </button>

            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1 px-2.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300"
              title="Redo design change"
            >
              <Redo2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Redo</span>
            </button>
          </div>
        </div>

        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('genre')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'genre'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>1. Genre Vibe</span>
          </button>

          <button
            onClick={() => setActiveTab('instrument')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'instrument'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Guitar className="w-3.5 h-3.5" />
            <span>2. Instruments</span>
          </button>

          <button
            onClick={() => setActiveTab('vocal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'vocal'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>3. Vocal Style</span>
          </button>

          <button
            onClick={() => setActiveTab('polish')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'polish'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. Production Polish</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Genre & Vibe */}
      {activeTab === 'genre' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select heritage genre foundations and vibe descriptors to establish the core musical direction.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GENRE_HERITAGE_OPTIONS.map(option => (
              <div
                key={option.id}
                className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-white">{option.label}</h3>
                  {option.bpmRange && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                      BPM {option.bpmRange}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-2">{option.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {option.tags.map(tag => {
                    const selected = pillarState.genre.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag('genre', tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                          selected
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-blue-400" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Genre Tag Input */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={pillarState.customGenre}
              onChange={e => setPillarState(prev => ({ ...prev, customGenre: e.target.value }))}
              placeholder="Or type custom genre tags (comma separated)..."
              className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Musical Instrumentation */}
      {activeTab === 'instrument' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select acoustic or electronic instruments to layer textures and harmonic arrangements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {INSTRUMENTATION_OPTIONS.map(option => (
              <div
                key={option.id}
                className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <h3 className="text-xs font-bold text-white mb-1">{option.label}</h3>
                <p className="text-[11px] text-slate-400 mb-2">{option.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {option.tags.map(tag => {
                    const selected = pillarState.instrumentation.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag('instrumentation', tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                          selected
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-cyan-400" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={pillarState.customInstrument}
              onChange={e => setPillarState(prev => ({ ...prev, customInstrument: e.target.value }))}
              placeholder="Or type custom instruments (e.g. koto harp, saxophone solo)..."
              className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Vocal Style */}
      {activeTab === 'vocal' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Define vocal gender, timbre, processing style (autotune, vocoder, harmonies, raspy delivery).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VOCAL_STYLE_OPTIONS.map(option => (
              <div
                key={option.id}
                className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <h3 className="text-xs font-bold text-white mb-1">{option.label}</h3>
                <p className="text-[11px] text-slate-400 mb-2">{option.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {option.tags.map(tag => {
                    const selected = pillarState.vocalStyle.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag('vocalStyle', tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                          selected
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-purple-400" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={pillarState.customVocal}
              onChange={e => setPillarState(prev => ({ ...prev, customVocal: e.target.value }))}
              placeholder="Or type custom vocal traits (e.g. opera soprano, whisper vocal)..."
              className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Production Polish */}
      {activeTab === 'polish' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Add mastering, spatial imaging, acoustic room characteristics, and technical mixing terms.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRODUCTION_POLISH_OPTIONS.map(option => (
              <div
                key={option.id}
                className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <h3 className="text-xs font-bold text-white mb-1">{option.label}</h3>
                <p className="text-[11px] text-slate-400 mb-2">{option.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {option.tags.map(tag => {
                    const selected = pillarState.productionPolish.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag('productionPolish', tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                          selected
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-amber-400" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={pillarState.customPolish}
              onChange={e => setPillarState(prev => ({ ...prev, customPolish: e.target.value }))}
              placeholder="Or type custom audio polish tags (e.g. sidechain compression, 24-bit)..."
              className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

    </div>
  );
};
