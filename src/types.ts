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

export interface MetadataVersionSnapshot {
  id: string;
  timestamp: string;
  title: string;
  concept: string;
  lyrics: string;
  stylePrompt: string;
  bpm: number;
  musicalKey: string;
  savedBy?: string;
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
  versionHistory?: MetadataVersionSnapshot[];
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
  isCustom?: boolean;
}

export interface PublicClass {
  id: string;
  title: string;
  instructor: string;
  category: 'Prompt Engineering' | 'Sound Design' | 'Lyrics & Vocals' | 'Copyright & Rights';
  description: string;
  schedule: string;
  duration: string;
  format: 'Live Interactive Lab' | 'Self-Paced Masterclass' | 'Bi-Weekly Clinic' | 'Webinar';
  seatsAvailable: number;
  maxSeats: number;
  level: 'All Levels' | 'Intermediate' | 'Advanced Producers';
  prerequisites: string;
  tags: string[];
  badgeColor: string;
}

export interface ClassEnrollmentDoc {
  id: string;
  userId: string;
  classId: string;
  classTitle: string;
  studentName: string;
  studentEmail: string;
  experienceLevel: string;
  specialFocus?: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
}

