import { create } from 'zustand';
import { auth, FirebaseUser } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  spotifyToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: FirebaseUser | null) => void;
  setError: (error: string | null) => void;
  setSpotifyToken: (token: string) => void;
  clearSpotifyToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  spotifyToken: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, isLoading: false, spotifyToken: null });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  setUser: (user) => set({ user, isLoading: false }),
  setError: (error) => set({ error, isLoading: false }),
  setSpotifyToken: (token) => set({ spotifyToken: token }),
  clearSpotifyToken: () => set({ spotifyToken: null }),
}));

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    useAuthStore.getState().setUser(user);
  } else {
    useAuthStore.getState().setUser(null);
  }
});
