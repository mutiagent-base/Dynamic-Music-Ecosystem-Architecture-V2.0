export interface PillarOption {
  id: string;
  label: string;
  description: string;
  category: 'genre' | 'instrument' | 'vocal' | 'polish';
  tags: string[];
  bpmRange?: string;
  keySuggestion?: string;
}

export interface PillarState {
  genre: string[];
  instrumentation: string[];
  vocalStyle: string[];
  productionPolish: string[];
  customGenre: string;
  customInstrument: string;
  customVocal: string;
  customPolish: string;
  bpm: number;
  musicalKey: string;
  autoEnhanced: boolean;
}

export interface ModerationResult {
  passed: boolean;
  warnings: string[];
  sanitizedStylePrompt: string;
  replacements: { original: string; replacedWith: string }[];
}

export interface SongMetadata {
  title: string;
  genreVibe: string;
  stylePrompt: string;
  bpm: number;
  musicalKey: string;
  lyrics: string;
  concept: string;
  vocalDesc: string;
  instrumentsDesc: string;
  productionDesc: string;
  attribution: {
    youtubeChannel: string;
    sunoProfile: string;
    license: string;
    masterpiecePropId: string;
  };
}

export interface Preset {
  id: string;
  title: string;
  description: string;
  genre: string[];
  instrumentation: string[];
  vocalStyle: string[];
  productionPolish: string[];
  bpm: number;
  musicalKey: string;
  sampleLyrics: string;
  rating: number;
}
