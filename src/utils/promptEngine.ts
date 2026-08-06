import { PillarState, SongMetadata } from '../types';
import { runGuardrailCheck } from '../data/guardrails';

export function assembleStylePrompt(state: PillarState): {
  rawStylePrompt: string;
  sanitizedStylePrompt: string;
  charCount: number;
  isOverLimit: boolean;
  guardrailPassed: boolean;
  replacements: { original: string; replacedWith: string }[];
} {
  const parts: string[] = [];

  // Pillar 1: Genre
  if (state.genre.length > 0) {
    parts.push(...state.genre);
  }
  if (state.customGenre.trim()) {
    parts.push(state.customGenre.trim());
  }

  // Pillar 2: Instrumentation
  if (state.instrumentation.length > 0) {
    parts.push(...state.instrumentation);
  }
  if (state.customInstrument.trim()) {
    parts.push(state.customInstrument.trim());
  }

  // Pillar 3: Vocal Style
  if (state.vocalStyle.length > 0) {
    parts.push(...state.vocalStyle);
  }
  if (state.customVocal.trim()) {
    parts.push(state.customVocal.trim());
  }

  // Pillar 4: Polish & Keywords
  if (state.productionPolish.length > 0) {
    parts.push(...state.productionPolish);
  }
  if (state.customPolish.trim()) {
    parts.push(state.customPolish.trim());
  }

  if (state.autoEnhanced) {
    parts.push('mastered', 'tape saturation', 'wide stereo');
  }

  // Deduplicate and join with comma
  const uniqueParts = Array.from(new Set(parts.map(p => p.toLowerCase())));
  const rawStylePrompt = uniqueParts.join(', ');

  // Run Guardrail Moderation
  const moderation = runGuardrailCheck(rawStylePrompt);
  const sanitizedStylePrompt = moderation.sanitizedText;

  const charCount = sanitizedStylePrompt.length;
  const isOverLimit = charCount > 120; // Suno limit is 120 characters

  return {
    rawStylePrompt,
    sanitizedStylePrompt,
    charCount,
    isOverLimit,
    guardrailPassed: moderation.passed,
    replacements: moderation.detectedTerms
  };
}

export function generateYouTubeDescription(metadata: SongMetadata): string {
  return `🎵 ${metadata.title} [Official Suno AI Music Production]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ Style Tags: ${metadata.stylePrompt}
▶ BPM: ${metadata.bpm} | Key: ${metadata.musicalKey}
▶ Production Engine: PromptCraft Sonic Blueprint V2.0 (4-Pillar Architecture)

📜 CONCEPT & SONG OVERVIEW:
${metadata.concept || 'A masterpiece AI music creation produced with the 4-Pillar Prompt Engine.'}

🎤 VOCAL SPECIFICATION:
${metadata.vocalDesc || 'High-fidelity vocal arrangement.'}

🎸 INSTRUMENTATION & POLISH:
${metadata.instrumentsDesc || 'Layered analog & acoustic instrumentation with studio mastering.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 ECOSYSTEM ATTRIBUTION & AUTHOR LINKS:
📌 Masterpiece Suno Profile: https://suno.com/@arcprompt (${metadata.attribution.sunoProfile})
📌 System Video Guide & Tutorials: https://youtube.com/@PRODROCK99 (${metadata.attribution.youtubeChannel})
📌 Repository Blueprint: https://github.com/mutiagent-base/promptcraft-sonic-blueprint

⚖️ LICENSE & ATTRIBUTION TERMS:
${metadata.attribution.license || 'Produced under the PromptCraft Open Attribution Model. Rights reserved to creator.'}
Ground Truth Database Reference ID: ${metadata.attribution.masterpiecePropId}
`;
}

export function generateSongMetadataJSON(metadata: SongMetadata, pillarState?: PillarState): string {
  return JSON.stringify({
    "$schema": "https://promptcraft.ai/schemas/song-metadata-v2.json",
    "project": "promptcraft-sonic-blueprint",
    "version": "2.0.0",
    "metadata": {
      "title": metadata.title,
      "genre_vibe": metadata.genreVibe,
      "style_prompt": metadata.stylePrompt,
      "bpm": metadata.bpm,
      "musical_key": metadata.musicalKey,
      "concept": metadata.concept,
      "vocal_description": metadata.vocalDesc,
      "instrumentation_description": metadata.instrumentsDesc,
      "production_polish": metadata.productionDesc,
      "lyrics": metadata.lyrics,
      "attribution": {
        "youtube_channel": metadata.attribution.youtubeChannel,
        "suno_profile": metadata.attribution.sunoProfile,
        "license": metadata.attribution.license,
        "masterpiece_prop_id": metadata.attribution.masterpiecePropId,
        "repository": "https://github.com/mutiagent-base/promptcraft-sonic-blueprint"
      },
      "created_at": new Date().toISOString()
    },
    "pillarState": pillarState || null
  }, null, 2);
}
