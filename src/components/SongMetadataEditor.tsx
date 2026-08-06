import React, { useState } from 'react';
import { SongMetadata, PillarState, MetadataVersionSnapshot } from '../types';
import { assembleStylePrompt } from '../utils/promptEngine';
import {
  FileText,
  Copy,
  Check,
  Download,
  Music2,
  Tag,
  Info,
  Sparkles,
  History,
  RotateCcw,
  Clock,
  Wand2,
  Loader2,
  Plus,
  RefreshCw,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

interface SongMetadataEditorProps {
  metadata: SongMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<SongMetadata>>;
  pillarState: PillarState;
  setPillarState?: React.Dispatch<React.SetStateAction<PillarState>>;
  onOpenExportModal: () => void;
}

interface LyricSuggestionOption {
  title: string;
  lyrics: string;
  explanation: string;
}

export const SongMetadataEditor: React.FC<SongMetadataEditorProps> = ({
  metadata,
  setMetadata,
  pillarState,
  setPillarState,
  onOpenExportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  // Gemini Smart Lyric Suggestions State
  const [sectionType, setSectionType] = useState<string>('Chorus');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<LyricSuggestionOption[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<{ idx: number; mode: 'append' | 'replace' } | null>(null);

  const assembled = assembleStylePrompt(pillarState);
  const versionHistory = metadata.versionHistory || [];

  const handleInsertStructureTag = (tag: string) => {
    setMetadata((prev) => ({
      ...prev,
      lyrics: prev.lyrics ? `${prev.lyrics}\n\n${tag}\n` : `${tag}\n`,
    }));
  };

  const copyToClipboard = (text: string, setCopiedFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  const handleRestoreVersion = (snapshot: MetadataVersionSnapshot) => {
    setMetadata((prev) => ({
      ...prev,
      title: snapshot.title,
      concept: snapshot.concept,
      lyrics: snapshot.lyrics,
      stylePrompt: snapshot.stylePrompt,
      bpm: snapshot.bpm,
      musicalKey: snapshot.musicalKey,
    }));

    if (setPillarState) {
      setPillarState((prev) => ({
        ...prev,
        bpm: snapshot.bpm,
        musicalKey: snapshot.musicalKey,
      }));
    }

    setRestoredId(snapshot.id);
    setTimeout(() => setRestoredId(null), 3000);
  };

  // Call Gemini Server Endpoint for Lyric Suggestions
  const handleGenerateSmartSuggestions = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSuggestions([]);

    try {
      const response = await fetch('/api/lyric-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: metadata.concept || 'High energy narrative',
          genreVibe: metadata.genreVibe || 'Synthwave / Electronic',
          sectionType,
          existingLyrics: metadata.lyrics,
          stylePrompt: assembled.sanitizedStylePrompt,
          bpm: pillarState.bpm,
          musicalKey: pillarState.musicalKey,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate suggestions.');
      }

      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error('Invalid response structure received from Gemini endpoint.');
      }
    } catch (err: any) {
      console.error('Lyric Suggestion Fetch Error:', err);
      setErrorMsg(err.message || 'Error communicating with Gemini AI server endpoint.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestion = (suggestionLyrics: string, mode: 'append' | 'replace', index: number) => {
    if (mode === 'replace') {
      setMetadata((prev) => ({
        ...prev,
        lyrics: suggestionLyrics,
      }));
    } else {
      setMetadata((prev) => ({
        ...prev,
        lyrics: prev.lyrics ? `${prev.lyrics.trim()}\n\n${suggestionLyrics}` : suggestionLyrics,
      }));
    }

    setAppliedIndex({ idx: index, mode });
    setTimeout(() => setAppliedIndex(null), 2500);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'editor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Song Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Version History</span>
            <span className="ml-1 px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] rounded-full font-mono">
              {versionHistory.length}
            </span>
          </button>
        </div>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON & YouTube Data</span>
        </button>
      </div>

      {/* Tab 1: Song Architecture Editor */}
      {activeTab === 'editor' && (
        <div className="space-y-5">
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
                onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
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
                onChange={(e) => setMetadata((prev) => ({ ...prev, concept: e.target.value }))}
                placeholder="e.g. Retro-futuristic story of midnight circuits and artificial memories"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Gemini AI Smart Lyric Suggestions Section */}
          <div className="p-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60 border border-purple-500/30 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                  <Wand2 className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Gemini AI Smart Lyric Completion</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.2 rounded-full font-mono">
                      Gemini 3.6 Flash
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Generates Suno-optimized rhyming verses or choruses based on <strong>"{metadata.concept || 'Concept'}"</strong> and <strong>"{metadata.genreVibe || 'Genre Vibe'}"</strong>.
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={sectionType}
                  onChange={(e) => setSectionType(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-purple-200 font-semibold focus:outline-none focus:border-purple-400"
                >
                  <option value="Chorus">Target: Chorus</option>
                  <option value="Verse">Target: Verse</option>
                  <option value="Pre-Chorus">Target: Pre-Chorus</option>
                  <option value="Bridge">Target: Bridge</option>
                  <option value="Outro">Target: Outro / Drop</option>
                  <option value="Full Song Structure">Target: Full Song</option>
                </select>

                <button
                  onClick={handleGenerateSmartSuggestions}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-950/40 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Lyrics</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Generated Suggestions Cards */}
            {suggestions.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-purple-500/20 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
                  <span className="flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gemini Lyric Options ({suggestions.length})</span>
                  </span>
                  <span className="text-slate-400 font-normal">
                    Click "Append" to add or "Replace" to overwrite current lyrics
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-3.5 flex flex-col justify-between space-y-3 hover:border-purple-400/60 transition-all shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                            {item.title}
                          </h4>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.lyrics);
                              setCopiedIndex(idx);
                              setTimeout(() => setCopiedIndex(null), 2000);
                            }}
                            className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                            title="Copy Lyrics"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {item.explanation && (
                          <p className="text-[11px] text-purple-200/80 italic">
                            "{item.explanation}"
                          </p>
                        )}

                        <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {item.lyrics}
                        </pre>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                        <button
                          onClick={() => handleApplySuggestion(item.lyrics, 'append', idx)}
                          className="px-2.5 py-1 bg-purple-600/80 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>
                            {appliedIndex?.idx === idx && appliedIndex.mode === 'append'
                              ? 'Appended!'
                              : 'Append to Lyrics'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleApplySuggestion(item.lyrics, 'replace', idx)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-700"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>
                            {appliedIndex?.idx === idx && appliedIndex.mode === 'replace'
                              ? 'Replaced!'
                              : 'Replace All'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {['[Intro]', '[Verse 1]', '[Pre-Chorus]', '[Chorus]', '[Bridge]', '[Guitar Solo]', '[Outro]', '[Fade Out]'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => handleInsertStructureTag(tag)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] rounded-md transition-colors border border-slate-700"
                  >
                    + {tag}
                  </button>
                )
              )}
            </div>

            <textarea
              rows={10}
              value={metadata.lyrics}
              onChange={(e) => setMetadata((prev) => ({ ...prev, lyrics: e.target.value }))}
              placeholder="Paste or write lyrics with section tags...&#10;&#10;[Verse 1]&#10;Midnight circuits glowing bright...&#10;&#10;[Chorus]&#10;We are neon shadows dancing in the code..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Version History Snapshots */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <p className="text-purple-200">
                <strong>Automatic Firebase Version Snapshots:</strong> A timestamped snapshot is automatically recorded every time you click "Save Blueprint" on the main toolbar.
              </p>
            </div>
          </div>

          {versionHistory.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-2">
              <Clock className="w-8 h-8 text-purple-400 mx-auto opacity-50" />
              <h4 className="text-xs font-bold text-slate-300">No Version History Captured Yet</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Make changes to your lyrics or title and click "Save Blueprint" to start building your song's immutable version history trail.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versionHistory.map((snapshot, index) => (
                <div
                  key={snapshot.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 space-y-3 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold rounded border border-purple-400/30">
                        v{versionHistory.length - index}.0
                      </span>
                      <h4 className="text-xs font-bold text-white">{snapshot.title}</h4>
                      <span className="text-[10px] text-cyan-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {snapshot.bpm} BPM
                      </span>
                      <span className="text-[10px] text-purple-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {snapshot.musicalKey}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {snapshot.timestamp}
                      </span>
                      {snapshot.savedBy && (
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          By: {snapshot.savedBy}
                        </span>
                      )}
                    </div>
                  </div>

                  {snapshot.concept && (
                    <p className="text-xs text-slate-400 italic">"{snapshot.concept}"</p>
                  )}

                  {snapshot.stylePrompt && (
                    <div className="text-[11px] font-mono text-cyan-300/80 bg-slate-950 p-2 rounded-lg border border-slate-800 truncate">
                      <strong>Style:</strong> {snapshot.stylePrompt}
                    </div>
                  )}

                  {snapshot.lyrics && (
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 max-h-28 overflow-y-auto whitespace-pre-wrap">
                      {snapshot.lyrics}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-slate-500">
                      {snapshot.lyrics
                        ? `${snapshot.lyrics.split('\n').length} lines of lyrics`
                        : 'No lyrics in snapshot'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(snapshot.lyrics, () => {})}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Copy Snapshot Lyrics
                      </button>

                      <button
                        onClick={() => handleRestoreVersion(snapshot)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                          restoredId === snapshot.id
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>
                          {restoredId === snapshot.id ? 'Restored!' : 'Restore This Version'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
