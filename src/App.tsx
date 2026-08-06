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
import { ClassEnrollmentModal } from './components/ClassEnrollmentModal';
import { QueryExecutorModal } from './components/QueryExecutorModal';
import { CustomerServiceModal } from './components/CustomerServiceModal';
import { CustomerServiceWidget } from './components/CustomerServiceWidget';
import { PillarState, SongMetadata, Preset, MetadataVersionSnapshot } from './types';
import { assembleStylePrompt } from './utils/promptEngine';
import { User } from './lib/firebase';
import {
  saveSongBlueprint,
  subscribeToUserSongs,
  deleteSongBlueprint,
  SavedSongDoc,
} from './lib/firestoreService';
import { Cloud, Save, FolderOpen, CheckCircle2, AlertCircle, ListTodo, GraduationCap, Terminal } from 'lucide-react';

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
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
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

      const snapshot: MetadataVersionSnapshot = {
        id: `ver-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        title: songMetadata.title || 'Untitled Blueprint',
        concept: songMetadata.concept || '',
        lyrics: songMetadata.lyrics || '',
        stylePrompt: songMetadata.stylePrompt || assembleStylePrompt(pillarState).sanitizedStylePrompt,
        bpm: pillarState.bpm,
        musicalKey: pillarState.musicalKey,
        savedBy: user.displayName || user.email || 'Firebase User',
      };

      const updatedHistory = [snapshot, ...(songMetadata.versionHistory || [])];
      const updatedMetadata = {
        ...songMetadata,
        versionHistory: updatedHistory,
      };

      setSongMetadata(updatedMetadata);

      const docId = await saveSongBlueprint(
        user.uid,
        updatedMetadata,
        pillarState,
        currentBlueprintId || undefined
      );
      setCurrentBlueprintId(docId);
      setSaveMessage('Saved version snapshot & blueprint to Firebase Cloud!');
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
      {/* Global Merged Header Toolbar */}
      <Header
        user={user}
        setUser={setUser}
        currentBlueprintId={currentBlueprintId}
        savedSongsCount={savedSongs.length}
        isSaving={isSaving}
        saveMessage={saveMessage}
        onSaveToFirestore={handleSaveToFirestore}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onOpenTasksModal={() => setIsTasksModalOpen(true)}
        onOpenClassesModal={() => setIsClassesModalOpen(true)}
        onOpenQueryModal={() => setIsQueryModalOpen(true)}
        onOpenSupportModal={() => setIsSupportModalOpen(true)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
              setPillarState={setPillarState}
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
        savedSongs={savedSongs}
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

      {/* Class Enrollment Modal */}
      <ClassEnrollmentModal
        isOpen={isClassesModalOpen}
        onClose={() => setIsClassesModalOpen(false)}
        user={user}
      />

      {/* Query Executor & Result Set Modal */}
      <QueryExecutorModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        user={user}
      />

      {/* Exceptional Real-Time Customer Service Modal & Floating Widget */}
      <CustomerServiceModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        user={user}
      />

      <CustomerServiceWidget
        onOpenModal={() => setIsSupportModalOpen(true)}
      />
    </div>
  );
};

export default App;
