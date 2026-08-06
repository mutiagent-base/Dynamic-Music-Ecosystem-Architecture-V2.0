import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Initialize GenAI helper
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API endpoint for Smart Lyric Suggestions
  app.post('/api/lyric-suggestions', async (req, res) => {
    try {
      const { concept, genreVibe, sectionType, existingLyrics, stylePrompt, bpm, musicalKey } = req.body;

      const ai = getGenAI();

      const prompt = `You are an expert lyricist and Suno AI music production specialist.
Generate creative lyric section completions for Suno V3.5/V4.

Song Concept/Narrative: "${concept || 'Atmospheric story of rhythm and emotion'}"
Genre/Vibe: "${genreVibe || 'Synthwave / Electronic'}"
Requested Section Type: "${sectionType || 'Verse or Chorus'}"
Style Prompt Context: "${stylePrompt || ''}"
BPM: ${bpm || 120}, Musical Key: "${musicalKey || 'C Major'}"

Current Lyrics Context:
${existingLyrics ? existingLyrics : '(No existing lyrics yet)'}

Instructions:
1. Provide 2-3 distinct, highly creative lyric section options.
2. Format lyrics clearly using Suno structural tags in square brackets like [Verse 1], [Verse 2], [Chorus], [Pre-Chorus], [Bridge], [Guitar Solo], [Outro], [Drop].
3. Ensure the imagery, rhythm, rhyme scheme, and vocabulary match the "${genreVibe}" genre and "${concept}" theme.
4. Return a JSON object with a "suggestions" array containing objects with:
   - "title": a descriptive label for the option (e.g. "Verse Continuation", "Anthemic Chorus", "Electrifying Bridge")
   - "lyrics": the formatted lyrics text with brackets
   - "explanation": a concise note on why this fits the genre and narrative flow.

Return strictly JSON matching this structure:
{
  "suggestions": [
    {
      "title": "Option 1: ...",
      "lyrics": "...",
      "explanation": "..."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const jsonText = response.text;
      if (!jsonText) {
        return res.status(500).json({ error: 'Empty response returned from Gemini AI.' });
      }

      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    } catch (error: any) {
      console.error('Smart Lyric Suggestions API Error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate lyric suggestions via Gemini AI.',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
