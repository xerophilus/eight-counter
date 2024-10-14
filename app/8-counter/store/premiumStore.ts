import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PremiumState {
  isPremium: boolean;
  setPremiumStatus: (status: boolean) => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      setPremiumStatus: (status: boolean) => set({ isPremium: status }),
    }),
    {
      name: 'premium-storage',
    }
  )
);
