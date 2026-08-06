import { PillarOption } from '../types';

export const GENRE_HERITAGE_OPTIONS: PillarOption[] = [
  {
    id: 'synthwave',
    label: 'Synthwave / Retrowave',
    description: '80s analog synthesizer aesthetics, driving basslines, retro-futuristic vibes',
    category: 'genre',
    tags: ['synthwave', '80s retrowave', 'cyberpunk', 'neon synth'],
    bpmRange: '110-128',
    keySuggestion: 'F Minor'
  },
  {
    id: 'cinematic',
    label: 'Cinematic Orchestral',
    description: 'Epic hans-zimmer style brass, sweeping strings, thunderous percussion',
    category: 'genre',
    tags: ['cinematic orchestral', 'epic trailer music', 'symphonic score'],
    bpmRange: '80-110',
    keySuggestion: 'D Minor'
  },
  {
    id: 'lofi',
    label: 'Lo-Fi Chill Hop',
    description: 'Mellow vinyl crackle, jazzy chords, relaxed boom-bap drum loops',
    category: 'genre',
    tags: ['lo-fi chillhop', 'jazzy beats', 'mellow study vibe', 'vinyl warmth'],
    bpmRange: '75-90',
    keySuggestion: 'C Major 7'
  },
  {
    id: 'cyberpunk',
    label: 'Dark Industrial Cyberpunk',
    description: 'Distorted reese bass, glitchy mechanical percussion, dark futuristic dystopia',
    category: 'genre',
    tags: ['dark cyberpunk', 'industrial electronic', 'glitch techno', 'distorted bass'],
    bpmRange: '120-135',
    keySuggestion: 'E Minor'
  },
  {
    id: 'citypop',
    label: 'Japanese City Pop',
    description: '80s Funk bassline, bright brass, shimmering rhodes, nostalgic disco groove',
    category: 'genre',
    tags: ['80s japanese city pop', 'funky disco groove', 'shimmering brass'],
    bpmRange: '115-125',
    keySuggestion: 'A Major'
  },
  {
    id: 'heavy-metal',
    label: 'Modern Progressive Metal',
    description: 'Heavy chugging djent guitars, double-bass drumming, soaring chorus',
    category: 'genre',
    tags: ['progressive djent metal', 'heavy chugging riffs', 'tight double-bass'],
    bpmRange: '130-160',
    keySuggestion: 'Drop D'
  },
  {
    id: 'acoustic-folk',
    label: 'Indie Acoustic Folk',
    description: 'Organic fingerpicked acoustic guitar, subtle cello, warm vocal harmonies',
    category: 'genre',
    tags: ['indie acoustic folk', 'fingerpicked guitar', 'organic warm intimacy'],
    bpmRange: '85-105',
    keySuggestion: 'G Major'
  },
  {
    id: 'melodic-edm',
    label: 'Melodic Progressive House',
    description: 'Soaring synth plucks, emotional build-ups, punchy four-on-the-floor kick',
    category: 'genre',
    tags: ['melodic house', 'progressive edm build-up', 'euphoric synth leads'],
    bpmRange: '124-128',
    keySuggestion: 'A Minor'
  }
];

export const INSTRUMENTATION_OPTIONS: PillarOption[] = [
  {
    id: 'analog-synths',
    label: 'Analog Synthesizer Stack',
    description: 'Moog basslines, Prophet-5 arpeggios, Juno-106 chorus pads',
    category: 'instrument',
    tags: ['analog synth bass', 'arpeggiated synth', 'warm Juno pads']
  },
  {
    id: 'orchestral-strings',
    label: 'Symphonic Strings & Brass',
    description: 'Staccato violins, thunderous French horns, cinematic timpani',
    category: 'instrument',
    tags: ['staccato violin section', 'epic French horn swell', 'pounding timpani']
  },
  {
    id: '808-drums',
    label: 'Punchy 808 Drums & Hi-Hats',
    description: 'Deep resonant 808 sub bass, crisp trap hi-hat rolls, tight snare',
    category: 'instrument',
    tags: ['deep 808 sub-bass', 'rolling hi-hats', 'crisp punchy snare']
  },
  {
    id: 'funky-guitar',
    label: 'Funky Electric Guitar & Bass',
    description: 'Clean funk rhythm strumming, slap bassline, wah-wah accent pedals',
    category: 'instrument',
    tags: ['clean funk guitar strum', 'groovy slap bass', 'wah-wah riff']
  },
  {
    id: 'acoustic-grand',
    label: 'Concert Grand Piano',
    description: 'Resonant acoustic grand piano with natural room ambience',
    category: 'instrument',
    tags: ['grand piano melody', 'warm rhodes electric piano']
  },
  {
    id: 'distorted-guitars',
    label: 'High-Gain Tube Amp Guitars',
    description: 'Overdriven electric guitar riffs, feedback delays, heavy chugs',
    category: 'instrument',
    tags: ['high-gain distorted guitar', 'heavy rhythm chugs', 'soaring guitar solo']
  }
];

export const VOCAL_STYLE_OPTIONS: PillarOption[] = [
  {
    id: 'female-airy',
    label: 'Airy Ethereal Female Lead',
    description: 'Breathary, soft harmonies, subtle reverb, intimacy',
    category: 'vocal',
    tags: ['ethereal female vocals', 'airy breathy tone', 'lush multi-tracked harmonies']
  },
  {
    id: 'male-baritone',
    label: 'Deep Resonant Baritone',
    description: 'Commanding male vocal presence, warm chest tone, expressive delivery',
    category: 'vocal',
    tags: ['deep male baritone lead', 'warm organic vocal tone', 'emotional delivery']
  },
  {
    id: 'autotuned-chops',
    label: 'Modern Autotuned Vocal Chops',
    description: 'Pitch-corrected vocal leads, pitched chops, vocoder harmonies',
    category: 'vocal',
    tags: ['pitch-corrected autotune', 'vocoder hook', 'rhythmic vocal chops']
  },
  {
    id: 'soaring-duet',
    label: 'Harmonized Male/Female Duet',
    description: 'Dynamic dual vocals, interlocking counter-melodies, powerful chorus swells',
    category: 'vocal',
    tags: ['male female duet', 'soaring vocal harmony', 'interlocking vocal lines']
  },
  {
    id: 'raw-punk',
    label: 'Raw Gritty Vocal Delivery',
    description: 'Energetic rasp, belted high notes, authentic raw indie tone',
    category: 'vocal',
    tags: ['raw raspy vocal tone', 'belted energetic chorus', 'indie rock vocals']
  }
];

export const PRODUCTION_POLISH_OPTIONS: PillarOption[] = [
  {
    id: 'studio-mastered',
    label: '24-Bit / 96kHz Studio Master',
    description: 'Pristine audio fidelity, wide dynamic range, crystal clarity',
    category: 'polish',
    tags: ['studio master 24-bit 96kHz', 'pristine audio fidelity', 'crystal clear mix']
  },
  {
    id: 'analog-warmth',
    label: 'Analog Tape Saturation',
    description: 'Subtle magnetic tape harmonic saturation, tube amp warmth, vintage glue',
    category: 'polish',
    tags: ['analog tape warmth', 'magnetic tape saturation', 'vintage tube glue']
  },
  {
    id: 'wide-stereo',
    label: 'Ultra-Wide Stereo Image',
    description: '3D spatial panning, stereo expansion, deep reverb tail depth',
    category: 'polish',
    tags: ['wide stereo image', '3D spatial depth', 'lush reverb tail']
  },
  {
    id: 'punchy-compression',
    label: 'Punchy Transients & Sidechain',
    description: 'Sidechain compression pumping, snappy drum transients, heavy impact',
    category: 'polish',
    tags: ['punchy sidechain compression', 'snappy drum transients', 'tight low-end']
  },
  {
    id: 'vinyl-crackle',
    label: 'Vintage Vinyl & Cassette Lo-Fi',
    description: 'Analog dust crackle, pitch wow & flutter, warm cassette hiss',
    category: 'polish',
    tags: ['vinyl crackle effect', 'cassette wow and flutter', 'vintage warm roll-off']
  }
];

export const MUSICAL_KEYS = [
  'C Major', 'C Minor', 'D Major', 'D Minor', 'E Major', 'E Minor',
  'F Major', 'F Minor', 'G Major', 'G Minor', 'A Major', 'A Minor',
  'B Major', 'B Minor', 'Bb Major', 'F# Minor'
];
