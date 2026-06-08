import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChildProfile, ChildNeed } from '@/types/app';

type ChildStore = {
  activeChild: ChildProfile | null;
  activeChildNeeds: ChildNeed[];
  setActiveChild: (child: ChildProfile | null) => void;
  setActiveChildNeeds: (needs: ChildNeed[]) => void;
};

export const useChildStore = create<ChildStore>()(
  persist(
    (set) => ({
      activeChild: null,
      activeChildNeeds: [],
      setActiveChild: (child) => set({ activeChild: child }),
      setActiveChildNeeds: (needs) => set({ activeChildNeeds: needs }),
    }),
    {
      name: 'breakthru-active-child',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
