import React, { useState } from 'react';
import { SongMetadata, PillarState } from '../types';
import { generateSongMetadataJSON, generateYouTubeDescription, assembleStylePrompt } from '../utils/promptEngine';
import { X, Copy, Check, Download, FileJson, FileText, CheckCircle2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: SongMetadata;
  pillarState: PillarState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  metadata,
  pillarState
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'json' | 'youtube'>('json');
  const [copied, setCopied] = useState(false);

  const assembled = assembleStylePrompt(pillarState);
  const currentMetadata: SongMetadata = {
    ...metadata,
    stylePrompt: assembled.sanitizedStylePrompt,
    bpm: pillarState.bpm,
    musicalKey: pillarState.musicalKey
  };

  const jsonOutput = generateSongMetadataJSON(currentMetadata);
  const ytOutput = generateYouTubeDescription(currentMetadata);

  const currentContent = activeTab === 'json' ? jsonOutput : ytOutput;
  const fileName = activeTab === 'json' ? `${metadata.title.toLowerCase().replace(/[^a-z0-0]/g, '_')}_metadata.json` : 'youtube_description.txt';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111726] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Export Song Metadata & Attribution Data
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'json'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileJson className="w-4 h-4" />
              <span>song-metadata-template.json</span>
            </button>

            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'youtube'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>youtube-description.txt</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
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

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Full traceability enabled. Includes Masterpiece Suno Profile (@arcprompt) & YouTube attribution links.</span>
        </div>

      </div>
    </div>
  );
};
