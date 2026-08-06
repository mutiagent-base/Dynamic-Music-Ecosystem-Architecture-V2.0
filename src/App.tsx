import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptOutput } from './components/PromptOutput';
import { GuardrailPanel } from './components/GuardrailPanel';
import { PillarSelector } from './components/PillarSelector';
import { SongMetadataEditor } from './components/SongMetadataEditor';
import { PresetsLibrary } from './components/PresetsLibrary';
import { AttributionHub } from './components/AttributionHub';
import { ExportModal } from './components/ExportModal';
import { CloudBlueprintsModal } from './components/CloudBlueprintsModal';
import { GoogleTasksModal } from './components/GoogleTasksModal';
import { PillarState, SongMetadata, Preset } from './types';
import { User } from './lib/firebase';
import {
  saveSongBlueprint,
  subscribeToUserSongs,
  deleteSongBlueprint,
  SavedSongDoc,
} from './lib/firestoreService';
import { Cloud, Save, FolderOpen, CheckCircle2, AlertCircle, ListTodo } from 'lucide-react';

export const App: React.FC = () => {
  // 0. User State
  const [user, setUser] = useState<User | null>(null);

  // 1. Initial Pillar State
  const [pillarState, setPillarState] = useState<PillarState>({
    genre: ['synthwave', '80s retrowave', 'cyberpunk'],
    instrumentation: ['analog synth bass', 'arpeggiated synth'],
    vocalStyle: ['ethereal female vocals', 'vocoder hook'],
    productionPolish: ['studio master 24-bit 96kHz', 'analog tape warmth', 'wide stereo image'],
    customGenre: '',
    customInstrument: '',
    customVocal: '',
    customPolish: '',
    bpm: 122,
    musicalKey: 'F Minor',
    autoEnhanced: true,
  });

  // 2. Initial Song Metadata State
  const [songMetadata, setSongMetadata] = useState<SongMetadata>({
    title: 'Neon Cyberpunk Horizon 2088',
    genreVibe: 'Synthwave / Retrowave Cyberpunk',
    stylePrompt: '',
    bpm: 122,
    musicalKey: 'F Minor',
    lyrics: `[Intro - Analog Synth Arpeggio & Distorted Bass]
(Neon rain falling on chrome pavements)
[BPM: 122] [Key: F Minor]

[Verse 1]
Midnight circuits glowing bright
Chrome reflections in the night
Through the fog of digital dreams
Nothing is quite what it seems

[Pre-Chorus]
Signal strength is fading fast
Will this artificial memory last?

[Chorus]
We are neon shadows dancing in the code
Running down this endless electric road
Light the sky with high voltage desire
Set the digital horizon on fire!

[Guitar Solo - Soaring Analog Synth & Tube Amp]

[Outro]
Fade to black... 0101...
[End]`,
    concept: 'High-octane retrowave story of artificial memories and cybernetic horizons.',
    vocalDesc: 'Airy female lead vocals with vocoder harmonic accents.',
    instrumentsDesc: 'Driving Moog bassline, Juno-106 chorus pads, tape saturation.',
    productionDesc: 'Mastered for vinyl, 24-bit 96kHz, wide 3D stereo panorama.',
    attribution: {
      youtubeChannel: '@PRODROCK99',
      sunoProfile: '@arcprompt',
      license: 'PromptCraft Open Attribution License V2.0',
      masterpiecePropId: 'PROP-SYNTHWAVE-2088',
    },
  });

  const [activePresetId, setActivePresetId] = useState<string>('synthwave-cyber');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [currentBlueprintId, setCurrentBlueprintId] = useState<string | null>(null);

  // Firestore Sync State
  const [savedSongs, setSavedSongs] = useState<SavedSongDoc[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Subscribe to User's Songs when logged in
  useEffect(() => {
    if (!user) {
      setSavedSongs([]);
      return;
    }
    const unsubscribe = subscribeToUserSongs(user.uid, (songs) => {
      setSavedSongs(songs);
    });
    return () => unsubscribe();
  }, [user]);

  // Handle Preset Loading
  const handleSelectPreset = (preset: Preset) => {
    setActivePresetId(preset.id);
    setPillarState({
      genre: preset.genre,
      instrumentation: preset.instrumentation,
      vocalStyle: preset.vocalStyle,
      productionPolish: preset.productionPolish,
      customGenre: '',
      customInstrument: '',
      customVocal: '',
      customPolish: '',
      bpm: preset.bpm,
      musicalKey: preset.musicalKey,
      autoEnhanced: true,
    });

    setSongMetadata((prev) => ({
      ...prev,
      title: preset.title,
      bpm: preset.bpm,
      musicalKey: preset.musicalKey,
      lyrics: preset.sampleLyrics,
      concept: preset.description,
      attribution: {
        ...prev.attribution,
        masterpiecePropId: `PROP-${preset.id.toUpperCase()}`,
      },
    }));
  };

  const handleCopyStylePrompt = (sanitizedPrompt: string) => {
    setSongMetadata((prev) => ({
      ...prev,
      stylePrompt: sanitizedPrompt,
    }));
  };

  // Save Blueprint to Firestore
  const handleSaveToFirestore = async () => {
    if (!user) {
      setSaveMessage('Please sign in or use Guest Mode to save blueprints to Firebase.');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      setIsSaving(true);
      const docId = await saveSongBlueprint(
        user.uid,
        songMetadata,
        pillarState,
        currentBlueprintId || undefined
      );
      setCurrentBlueprintId(docId);
      setSaveMessage('Saved to Firebase Cloud Firestore!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('Save to Firestore Error:', err);
      setSaveMessage('Error saving to Firestore: ' + (err.message || 'Permission denied'));
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Load Song Blueprint from Firestore
  const handleLoadBlueprint = (song: SavedSongDoc) => {
    setCurrentBlueprintId(song.id);
    if (song.pillarState) {
      setPillarState(song.pillarState);
    }
    setSongMetadata((prev) => ({
      ...prev,
      title: song.title || 'Untitled',
      genreVibe: song.genreVibe || '',
      stylePrompt: song.stylePrompt || '',
      bpm: song.bpm || 120,
      musicalKey: song.musicalKey || 'C Major',
      lyrics: song.lyrics || '',
      concept: song.concept || '',
      vocalDesc: song.vocalDesc || '',
      instrumentsDesc: song.instrumentsDesc || '',
      productionDesc: song.productionDesc || '',
    }));
    setIsCloudModalOpen(false);
  };

  const handleDeleteBlueprint = async (songId: string) => {
    try {
      await deleteSongBlueprint(songId);
      if (currentBlueprintId === songId) {
        setCurrentBlueprintId(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Global Header */}
      <Header
        user={user}
        setUser={setUser}
        onOpenTasksModal={() => setIsTasksModalOpen(true)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Firebase Storage Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-[#101728] to-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Cloud className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Firebase Cloud Blueprint Storage & Workspace Tasks</span>
                {currentBlueprintId && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                    ID: {currentBlueprintId.slice(0, 8)}...
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {user
                  ? `Connected as ${user.displayName || user.email || 'Guest'}. Real-time Firestore sync & Google Tasks active.`
                  : 'Sign in or start guest session to persist custom prompts and export production tasks to Google Tasks.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {saveMessage && (
              <span className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{saveMessage}</span>
              </span>
            )}

            <button
              onClick={() => setIsTasksModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/90 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all border border-blue-500/30"
            >
              <ListTodo className="w-4 h-4 text-blue-200" />
              <span>Google Tasks</span>
            </button>

            <button
              onClick={handleSaveToFirestore}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save to Firebase'}</span>
            </button>

            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all relative"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>My Saved Blueprints</span>
              {savedSongs.length > 0 && (
                <span className="ml-1 bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.2 text-[10px] rounded-full">
                  {savedSongs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Top Output Bar & Guardrail Check */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PromptOutput
              pillarState={pillarState}
              setPillarState={setPillarState}
              onCopyStylePrompt={handleCopyStylePrompt}
            />
          </div>

          <div className="lg:col-span-1">
            <GuardrailPanel pillarState={pillarState} />
          </div>
        </div>

        {/* Middle Section: 4-Pillar Matrix & Presets Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PillarSelector
              pillarState={pillarState}
              setPillarState={setPillarState}
            />
          </div>

          <div className="lg:col-span-1">
            <PresetsLibrary
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
              user={user}
              pillarState={pillarState}
            />
          </div>
        </div>

        {/* Bottom Section: Metadata Editor & Ecosystem Attribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SongMetadataEditor
              metadata={songMetadata}
              setMetadata={setSongMetadata}
              pillarState={pillarState}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-1">
            <AttributionHub
              metadata={songMetadata}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0a0d16] py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-2">
          <p>
            PromptCraft Sonic Blueprint &copy; 2026. Powered by Firebase Cloud Firestore & Suno AI Prompt Matrix.
          </p>
          <div className="flex justify-center items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>YouTube: @PRODROCK99</span>
            <span>•</span>
            <span>Suno: @arcprompt</span>
            <span>•</span>
            <span>GitHub: mutiagent-base/promptcraft-sonic-blueprint</span>
          </div>
        </div>
      </footer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        metadata={songMetadata}
        pillarState={pillarState}
      />

      {/* Cloud Blueprints Modal */}
      <CloudBlueprintsModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        user={user}
        savedSongs={savedSongs}
        onLoadBlueprint={handleLoadBlueprint}
        onDeleteBlueprint={handleDeleteBlueprint}
      />

      {/* Google Tasks Modal */}
      <GoogleTasksModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        user={user}
        metadata={songMetadata}
        pillarState={pillarState}
      />
    </div>
  );
};

export default App;
