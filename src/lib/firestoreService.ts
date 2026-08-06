import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from './firebase';
import { SongMetadata, PillarState, Preset, ClassEnrollmentDoc, MetadataVersionSnapshot } from '../types';

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
  versionHistory?: MetadataVersionSnapshot[];
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
    versionHistory: metadata.versionHistory || [],
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

// Save Public Class Enrollment
export const saveClassEnrollment = async (
  userId: string,
  enrollmentData: Omit<ClassEnrollmentDoc, 'id' | 'userId' | 'enrolledAt' | 'status'>
): Promise<string> => {
  const enrollmentsRef = collection(db, 'enrollments');
  const docRef = doc(enrollmentsRef);

  const payload = {
    userId,
    classId: enrollmentData.classId,
    classTitle: enrollmentData.classTitle,
    studentName: enrollmentData.studentName,
    studentEmail: enrollmentData.studentEmail,
    experienceLevel: enrollmentData.experienceLevel,
    specialFocus: enrollmentData.specialFocus || '',
    status: 'active',
    enrolledAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  return docRef.id;
};

// Subscribe to User's Class Enrollments
export const subscribeToUserEnrollments = (
  userId: string,
  onUpdate: (enrollments: ClassEnrollmentDoc[]) => void,
  onError?: (err: Error) => void
) => {
  const enrollmentsRef = collection(db, 'enrollments');
  const q = query(enrollmentsRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const enrollments: ClassEnrollmentDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ClassEnrollmentDoc, 'id'>),
      }));
      enrollments.sort((a, b) => (b.enrolledAt || '').localeCompare(a.enrolledAt || ''));
      onUpdate(enrollments);
    },
    (err) => {
      console.error('Error fetching enrollments:', err);
      if (onError) onError(err);
    }
  );
};

// Cancel Class Enrollment
export const cancelClassEnrollment = async (enrollmentId: string): Promise<void> => {
  const docRef = doc(db, 'enrollments', enrollmentId);
  await deleteDoc(docRef);
};

// --- QUERY EXECUTION & RESULT SET ENGINE ---

export interface QueryExecutionResult {
  collectionName: string;
  queryFilter: {
    field?: string;
    operator?: string;
    value?: string;
    limitCount: number;
  };
  executionTimeMs: number;
  totalResults: number;
  executedAt: string;
  items: Array<{ id: string; [key: string]: any }>;
}

export const executeCollectionQuery = async (
  userId: string,
  collectionName: string,
  fieldFilter?: string,
  operator: string = '==',
  filterValue?: string,
  limitCount: number = 25
): Promise<QueryExecutionResult> => {
  const startTime = performance.now();
  const targetRef = collection(db, collectionName);

  const queryConstraints: any[] = [where('userId', '==', userId)];

  if (fieldFilter && filterValue !== undefined && filterValue !== '') {
    let parsedValue: any = filterValue;
    if (filterValue.toLowerCase() === 'true') parsedValue = true;
    else if (filterValue.toLowerCase() === 'false') parsedValue = false;
    else if (!isNaN(Number(filterValue)) && filterValue.trim() !== '') parsedValue = Number(filterValue);

    queryConstraints.push(where(fieldFilter, operator as any, parsedValue));
  }

  queryConstraints.push(limit(limitCount));

  const q = query(targetRef, ...queryConstraints);
  const snapshot = await getDocs(q);

  const items: Array<{ id: string; [key: string]: any }> = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const endTime = performance.now();
  const executionTimeMs = Math.round(endTime - startTime);

  return {
    collectionName,
    queryFilter: {
      field: fieldFilter,
      operator,
      value: filterValue,
      limitCount,
    },
    executionTimeMs,
    totalResults: items.length,
    executedAt: new Date().toLocaleTimeString(),
    items,
  };
};

export const updateItemInResultSet = async (
  collectionName: string,
  itemId: string,
  updateFields: Record<string, any>
): Promise<void> => {
  const docRef = doc(db, collectionName, itemId);
  await updateDoc(docRef, {
    ...updateFields,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteItemInResultSet = async (
  collectionName: string,
  itemId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, itemId);
  await deleteDoc(docRef);
};

// --- REAL-TIME CUSTOMER SERVICE SUPPORT TICKET ENGINE ---

export interface SupportTicketMessage {
  id: string;
  sender: 'user' | 'agent' | 'ai-concierge';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicketDoc {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: 'standard' | 'high' | 'urgent-vip';
  status: 'open' | 'in-progress' | 'resolved';
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
  rating?: number;
}

export const createSupportTicket = async (
  userId: string,
  userEmail: string,
  subject: string,
  category: string,
  priority: 'standard' | 'high' | 'urgent-vip',
  initialText: string,
  aiResponseText?: string
): Promise<string> => {
  const ticketsRef = collection(db, 'tickets');
  const docRef = doc(ticketsRef);

  const initialMessages: SupportTicketMessage[] = [
    {
      id: 'msg-1',
      sender: 'user',
      senderName: userEmail || 'Music Creator',
      text: initialText,
      timestamp: new Date().toLocaleTimeString(),
    },
  ];

  if (aiResponseText) {
    initialMessages.push({
      id: 'msg-2',
      sender: 'ai-concierge',
      senderName: 'Sonic AI Concierge',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  const payload = {
    userId,
    subject,
    category,
    priority,
    status: 'open',
    messages: initialMessages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  return docRef.id;
};

export const subscribeToUserTickets = (
  userId: string,
  onUpdate: (tickets: SupportTicketDoc[]) => void,
  onError?: (err: Error) => void
) => {
  const ticketsRef = collection(db, 'tickets');
  const q = query(ticketsRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const tickets: SupportTicketDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SupportTicketDoc, 'id'>),
      }));
      tickets.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(tickets);
    },
    (err) => {
      console.error('Error fetching support tickets:', err);
      if (onError) onError(err);
    }
  );
};

export const addMessageToTicket = async (
  ticketId: string,
  currentMessages: SupportTicketMessage[],
  newMessage: Omit<SupportTicketMessage, 'id' | 'timestamp'>
): Promise<void> => {
  const docRef = doc(db, 'tickets', ticketId);
  const updatedMessages: SupportTicketMessage[] = [
    ...currentMessages,
    {
      ...newMessage,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ];

  await updateDoc(docRef, {
    messages: updatedMessages,
    updatedAt: new Date().toISOString(),
  });
};

export const updateTicketStatus = async (
  ticketId: string,
  status: 'open' | 'in-progress' | 'resolved',
  rating?: number
): Promise<void> => {
  const docRef = doc(db, 'tickets', ticketId);
  const updatePayload: any = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (rating !== undefined) {
    updatePayload.rating = rating;
  }
  await updateDoc(docRef, updatePayload);
};


