export interface GuardrailRule {
  bannedTerm: RegExp;
  termString: string;
  replacement: string;
  category: 'artist' | 'trademark' | 'explicit';
}

export const GUARDRAIL_RULES: GuardrailRule[] = [
  {
    bannedTerm: /\btaylor\s*swift\b/gi,
    termString: 'Taylor Swift',
    replacement: 'catchy country-pop female lead, narrative acoustic guitar hook',
    category: 'artist'
  },
  {
    bannedTerm: /\bdrake\b/gi,
    termString: 'Drake',
    replacement: 'melodic Toronto trap bass, filtered underwater rhodes, ambient vocal croon',
    category: 'artist'
  },
  {
    bannedTerm: /\bdaft\s*punk\b/gi,
    termString: 'Daft Punk',
    replacement: 'french touch filtered disco house, analog vocoder vocal, funky slap bass',
    category: 'artist'
  },
  {
    bannedTerm: /\bhans\s*zimmer\b/gi,
    termString: 'Hans Zimmer',
    replacement: 'epic cinematic orchestral swell, thunderous brass impact, ostinato strings',
    category: 'artist'
  },
  {
    bannedTerm: /\bbillie\s*eilish\b/gi,
    termString: 'Billie Eilish',
    replacement: 'whispering intimate female vocals, sub-bass pulse, dark minimalist pop',
    category: 'artist'
  },
  {
    bannedTerm: /\bthe\s*weeknd\b/gi,
    termString: 'The Weeknd',
    replacement: 'dark 80s synthpop, soaring falsetto male vocal, dark brooding analog synth',
    category: 'artist'
  },
  {
    bannedTerm: /\bbts\b/gi,
    termString: 'BTS',
    replacement: 'high-energy K-pop dance groove, polished vocal harmonies, brassy synth pop',
    category: 'artist'
  },
  {
    bannedTerm: /\bmetallica\b/gi,
    termString: 'Metallica',
    replacement: 'heavy thrash metal guitar riffs, aggressive double-bass drums, raw vocal power',
    category: 'artist'
  },
  {
    bannedTerm: /\bed\s*sheeran\b/gi,
    termString: 'Ed Sheeran',
    replacement: 'acoustic loop pedal strum, soulful warm tenor vocal, indie pop rhythm',
    category: 'artist'
  },
  {
    bannedTerm: /\bskrillex\b/gi,
    termString: 'Skrillex',
    replacement: 'aggressive dubstep bass growls, hyper-glitched vocal chops, heavy drop',
    category: 'artist'
  }
];

export function runGuardrailCheck(text: string): {
  passed: boolean;
  sanitizedText: string;
  detectedTerms: { original: string; replacedWith: string }[];
} {
  let sanitizedText = text;
  const detectedTerms: { original: string; replacedWith: string }[] = [];

  for (const rule of GUARDRAIL_RULES) {
    if (rule.bannedTerm.test(sanitizedText)) {
      sanitizedText = sanitizedText.replace(rule.bannedTerm, rule.replacement);
      detectedTerms.push({
        original: rule.termString,
        replacedWith: rule.replacement
      });
    }
  }

  return {
    passed: detectedTerms.length === 0,
    sanitizedText,
    detectedTerms
  };
}
