import { create } from 'zustand';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';

interface SheetState {
  currentSheetId: string | null;
  songUri: string | null;
  songDuration: number | null;
  bpm: number;
  eightCounts: string[];
  setSongInfo: (uri: string, duration: number) => void;
  setBpm: (bpm: number) => void;
  setEightCounts: (counts: string[]) => void;
  updateEightCount: (index: number, text: string) => void;
  saveSheet: (title: string) => Promise<void>;
  loadSheet: (sheetId: string) => Promise<void>;
  getSavedSheets: () => Promise<{ id: string; title: string }[]>;
}

export const useSheetStore = create<SheetState>((set, get) => ({
  currentSheetId: null,
  songUri: null,
  songDuration: null,
  bpm: 120,
  eightCounts: [],
  setSongInfo: (uri: string, duration: number) => set({ songUri: uri, songDuration: duration }),
  setBpm: (bpm: number) => set({ bpm }),
  setEightCounts: (counts: string[]) => set({ eightCounts: counts }),
  updateEightCount: (index: number, text: string) =>
    set((state) => {
      const newCounts = [...state.eightCounts];
      newCounts[index] = text;
      return { eightCounts: newCounts };
    }),
  saveSheet: async (title: string) => {
    const { currentSheetId, songUri, songDuration, bpm, eightCounts } = get();
    const sheetData = {
      title,
      songUri,
      songDuration,
      bpm,
      eightCounts,
      updatedAt: new Date(),
    };

    try {
      if (currentSheetId) {
        await updateDoc(doc(db, 'sheets', currentSheetId), sheetData);
      } else {
        const docRef = await addDoc(collection(db, 'sheets'), {
          ...sheetData,
          createdAt: new Date(),
        });
        set({ currentSheetId: docRef.id });
      }
    } catch (error) {
      console.error('Error saving sheet:', error);
    }
  },
  loadSheet: async (sheetId: string) => {
    try {
      const sheetDoc = await getDoc(doc(db, 'sheets', sheetId));
      if (sheetDoc.exists()) {
        const data = sheetDoc.data() as DocumentData;
        set({
          currentSheetId: sheetId,
          songUri: data.songUri,
          songDuration: data.songDuration,
          bpm: data.bpm,
          eightCounts: data.eightCounts,
        });
      }
    } catch (error) {
      console.error('Error loading sheet:', error);
    }
  },
  getSavedSheets: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'sheets'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
    } catch (error) {
      console.error('Error getting saved sheets:', error);
      return [];
    }
  },
}));
