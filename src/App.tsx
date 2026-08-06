import React, { useState } from 'react';
import { Header } from './components/Header';
import { PromptOutput } from './components/PromptOutput';
import { GuardrailPanel } from './components/GuardrailPanel';
import { PillarSelector } from './components/PillarSelector';
import { SongMetadataEditor } from './components/SongMetadataEditor';
import { PresetsLibrary } from './components/PresetsLibrary';
import { AttributionHub } from './components/AttributionHub';
import { ExportModal } from './components/ExportModal';
import { PillarState, SongMetadata, Preset } from './types';
import { MASTERPIECE_PRESETS } from './data/presets';

export const App: React.FC = () => {
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
    autoEnhanced: true
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
      masterpiecePropId: 'PROP-SYNTHWAVE-2088'
    }
  });

  const [activePresetId, setActivePresetId] = useState<string>('synthwave-cyber');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
      autoEnhanced: true
    });

    setSongMetadata(prev => ({
      ...prev,
      title: preset.title,
      bpm: preset.bpm,
      musicalKey: preset.musicalKey,
      lyrics: preset.sampleLyrics,
      concept: preset.description,
      attribution: {
        ...prev.attribution,
        masterpiecePropId: `PROP-${preset.id.toUpperCase()}`
      }
    }));
  };

  const handleCopyStylePrompt = (sanitizedPrompt: string) => {
    setSongMetadata(prev => ({
      ...prev,
      stylePrompt: sanitizedPrompt
    }));
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Global Header */}
      <Header />

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
            PromptCraft Sonic Blueprint &copy; 2026. Designed for Suno AI Music Generation and Masterpiece Prop Attribution.
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
    </div>
  );
};

export default App;
