import React, { useState, useEffect } from 'react';
import { SongMetadata, PillarState } from '../types';
import { SavedSongDoc } from '../lib/firestoreService';
import { generateSongMetadataJSON, generateYouTubeDescription, assembleStylePrompt } from '../utils/promptEngine';
import { X, Copy, Check, Download, FileJson, FileText, CheckCircle2, Archive, CheckSquare, Square, Layers, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: SongMetadata;
  pillarState: PillarState;
  savedSongs?: SavedSongDoc[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  metadata,
  pillarState,
  savedSongs = [],
}) => {
  if (!isOpen) return null;

  const [mainTab, setMainTab] = useState<'single' | 'bulk'>('single');
  const [activeTab, setActiveTab] = useState<'json' | 'youtube'>('json');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Initialize selectedIds when savedSongs changes or tab opens
  useEffect(() => {
    if (savedSongs.length > 0 && selectedIds.length === 0) {
      setSelectedIds(savedSongs.map((s) => s.id));
    }
  }, [savedSongs]);

  const assembled = assembleStylePrompt(pillarState);
  const currentMetadata: SongMetadata = {
    ...metadata,
    stylePrompt: assembled.sanitizedStylePrompt,
    bpm: pillarState.bpm,
    musicalKey: pillarState.musicalKey,
  };

  const singleJsonOutput = generateSongMetadataJSON(currentMetadata, pillarState);
  const singleYtOutput = generateYouTubeDescription(currentMetadata);

  const currentContent = activeTab === 'json' ? singleJsonOutput : singleYtOutput;
  const fileName =
    activeTab === 'json'
      ? `${metadata.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_metadata.json`
      : 'youtube_description.txt';

  const handleCopySingle = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Select / Deselect All Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === savedSongs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(savedSongs.map((s) => s.id));
    }
  };

  const handleToggleSong = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Generate Bulk JSON output
  const getSelectedSongsData = () => {
    return savedSongs.filter((s) => selectedIds.includes(s.id));
  };

  const handleDownloadBulkJSON = () => {
    const selected = getSelectedSongsData();
    const bulkData = {
      exportTimestamp: new Date().toISOString(),
      totalBlueprints: selected.length,
      blueprints: selected,
    };

    const jsonString = JSON.stringify(bulkData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptcraft_bulk_blueprints_${selected.length}_items.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate & Download ZIP Archive
  const handleDownloadZIP = async () => {
    const selected = getSelectedSongsData();
    if (selected.length === 0) return;

    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('promptcraft_blueprints');

      selected.forEach((song, idx) => {
        const cleanTitle = (song.title || `blueprint_${idx + 1}`)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_');

        const songMeta: SongMetadata = {
          title: song.title,
          genreVibe: song.genreVibe || '',
          stylePrompt: song.stylePrompt || '',
          bpm: song.bpm || 120,
          musicalKey: song.musicalKey || 'C Major',
          lyrics: song.lyrics || '',
          concept: song.concept || '',
          vocalDesc: song.vocalDesc || '',
          instrumentsDesc: song.instrumentsDesc || '',
          productionDesc: song.productionDesc || '',
          attribution: {
            youtubeChannel: 'PromptCraft Producer',
            sunoProfile: 'Suno Creator',
            license: 'CC-BY-4.0',
            masterpiecePropId: `PROP-${song.id.slice(0, 8)}`,
          },
        };

        const songJson = generateSongMetadataJSON(songMeta, song.pillarState);
        const songYt = generateYouTubeDescription(songMeta);

        folder?.file(`${idx + 1}_${cleanTitle}_metadata.json`, songJson);
        folder?.file(`${idx + 1}_${cleanTitle}_youtube.txt`, songYt);
      });

      // Add manifest summary index file
      const manifest = {
        exportedAt: new Date().toISOString(),
        totalTracks: selected.length,
        tracksIndex: selected.map((s) => ({ id: s.id, title: s.title, bpm: s.bpm, key: s.musicalKey })),
      };
      folder?.file('MANIFEST_INDEX.json', JSON.stringify(manifest, null, 2));

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = url;
      link.download = `promptcraft_blueprints_package_${selected.length}_tracks.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP creation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111726] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Export Song Metadata & Bulk Blueprint Packages
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Mode Tabs */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex gap-2 font-bold">
            <button
              onClick={() => setMainTab('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                mainTab === 'single'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <FileJson className="w-4 h-4 text-cyan-300" />
              <span>Active Song Blueprint</span>
            </button>

            <button
              onClick={() => setMainTab('bulk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative ${
                mainTab === 'bulk'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Archive className="w-4 h-4 text-amber-400" />
              <span>Bulk Export (ZIP & Multi-JSON)</span>
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] rounded-full font-mono">
                {savedSongs.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Suno V3.5/V4 & YouTube Metadata Export Engine</span>
          </div>
        </div>

        {/* MODE 1: Single Active Blueprint Export */}
        {mainTab === 'single' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Modal Sub Tab Switcher */}
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('json')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'json' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileJson className="w-4 h-4" />
                  <span>song-metadata-template.json</span>
                </button>

                <button
                  onClick={() => setActiveTab('youtube')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'youtube' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>youtube-description.txt</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySingle}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadSingle}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* Content Box */}
            <div className="p-4 flex-1 overflow-y-auto">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
                {currentContent}
              </pre>
            </div>
          </div>
        )}

        {/* MODE 2: Bulk Multi-Blueprint Export (ZIP & JSON) */}
        {mainTab === 'bulk' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {savedSongs.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">No Saved Blueprints Found for Bulk Export</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Save one or more song blueprints to your Firebase Cloud collection first to export them as a single ZIP or combined JSON package.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Control Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <button
                    onClick={handleToggleSelectAll}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                  >
                    {selectedIds.length === savedSongs.length ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedIds.length === savedSongs.length ? 'Deselect All' : 'Select All Blueprints'}
                    </span>
                  </button>

                  <span className="text-xs font-mono text-cyan-300 font-bold bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                    Selected: {selectedIds.length} of {savedSongs.length} Blueprints
                  </span>

                  {/* Bulk Download Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadBulkJSON}
                      disabled={selectedIds.length === 0}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <FileJson className="w-3.5 h-3.5" />
                      <span>Download Bulk JSON</span>
                    </button>

                    <button
                      onClick={handleDownloadZIP}
                      disabled={selectedIds.length === 0 || isZipping}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                    >
                      <Archive className="w-4 h-4 fill-slate-950" />
                      <span>{isZipping ? 'Creating ZIP Package...' : 'Download ZIP Package (.zip)'}</span>
                    </button>
                  </div>
                </div>

                {/* Blueprint Selection Checkbox List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {savedSongs.map((song) => {
                    const isSelected = selectedIds.includes(song.id);
                    return (
                      <div
                        key={song.id}
                        onClick={() => handleToggleSong(song.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-950/30'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-60'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                            <span className="text-[10px] bg-slate-800 text-cyan-300 font-mono px-1.5 py-0.2 rounded">
                              {song.bpm} BPM
                            </span>
                          </div>

                          {song.concept && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">{song.concept}</p>
                          )}

                          <div className="text-[10px] text-slate-500 font-mono truncate">
                            Key: {song.musicalKey} • {song.lyrics ? `${song.lyrics.split('\n').length} lines` : 'No lyrics'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ZIP and Bulk JSON packages contain full 4-Pillar states, Suno prompts, and YouTube metadata.</span>
          </div>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
            PromptCraft Bulk Exporter V2.0
          </span>
        </div>

      </div>
    </div>
  );
};
