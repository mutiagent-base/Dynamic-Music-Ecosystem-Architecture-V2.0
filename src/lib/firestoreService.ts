import {
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from './firebase';
import { SongMetadata, PillarState, Preset } from '../types';

export interface SavedSongDoc {
  id: string;
  userId: string;
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
  pillarState: PillarState;
  createdAt?: string;
}

// Save or Update Song Blueprint in Firestore
export const saveSongBlueprint = async (
  userId: string,
  metadata: SongMetadata,
  pillarState: PillarState,
  existingId?: string
): Promise<string> => {
  const songsRef = collection(db, 'songs');
  const docRef = existingId ? doc(db, 'songs', existingId) : doc(songsRef);

  const payload = {
    userId,
    title: metadata.title || 'Untitled Blueprint',
    genreVibe: metadata.genreVibe || '',
    stylePrompt: metadata.stylePrompt || '',
    bpm: metadata.bpm || 120,
    musicalKey: metadata.musicalKey || 'C Major',
    lyrics: metadata.lyrics || '',
    concept: metadata.concept || '',
    vocalDesc: metadata.vocalDesc || '',
    instrumentsDesc: metadata.instrumentsDesc || '',
    productionDesc: metadata.productionDesc || '',
    pillarState,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload, { merge: true });
  return docRef.id;
};

// Listen to User's Saved Songs
export const subscribeToUserSongs = (
  userId: string,
  onUpdate: (songs: SavedSongDoc[]) => void,
  onError?: (err: Error) => void
) => {
  const songsRef = collection(db, 'songs');
  const q = query(songsRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const songs: SavedSongDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SavedSongDoc, 'id'>),
      }));
      // Sort in memory by createdAt desc
      songs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(songs);
    },
    (error) => {
      console.error('Error fetching songs:', error);
      if (onError) onError(error);
    }
  );
};

// Delete Song Blueprint
export const deleteSongBlueprint = async (songId: string): Promise<void> => {
  const docRef = doc(db, 'songs', songId);
  await deleteDoc(docRef);
};

// Save Custom Preset to Firestore
export const saveUserPreset = async (
  userId: string,
  presetData: Omit<Preset, 'id'>
): Promise<string> => {
  const presetsRef = collection(db, 'presets');
  const docRef = doc(presetsRef);

  const payload = {
    userId,
    title: presetData.title,
    description: presetData.description,
    genre: presetData.genre,
    instrumentation: presetData.instrumentation,
    vocalStyle: presetData.vocalStyle,
    productionPolish: presetData.productionPolish,
    bpm: presetData.bpm,
    musicalKey: presetData.musicalKey,
    sampleLyrics: presetData.sampleLyrics,
    rating: presetData.rating || 5.0,
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  return docRef.id;
};

// Listen to User Presets
export const subscribeToUserPresets = (
  userId: string,
  onUpdate: (presets: Preset[]) => void
) => {
  const presetsRef = collection(db, 'presets');
  const q = query(presetsRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const presets: Preset[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title,
        description: data.description,
        genre: data.genre || [],
        instrumentation: data.instrumentation || [],
        vocalStyle: data.vocalStyle || [],
        productionPolish: data.productionPolish || [],
        bpm: data.bpm || 120,
        musicalKey: data.musicalKey || 'C Major',
        sampleLyrics: data.sampleLyrics || '',
        rating: data.rating || 5.0,
        isCustom: true,
      };
    });
    onUpdate(presets);
  });
};

// Delete Preset
export const deleteUserPreset = async (presetId: string): Promise<void> => {
  const docRef = doc(db, 'presets', presetId);
  await deleteDoc(docRef);
};
