import { create } from 'zustand';
import type { ChildProfile, ChildNeed } from '@/types/app';

type ChildStore = {
  activeChild: ChildProfile | null;
  activeChildNeeds: ChildNeed[];
  setActiveChild: (child: ChildProfile | null) => void;
  setActiveChildNeeds: (needs: ChildNeed[]) => void;
};

export const useChildStore = create<ChildStore>((set) => ({
  activeChild: null,
  activeChildNeeds: [],
  setActiveChild: (child) => set({ activeChild: child }),
  setActiveChildNeeds: (needs) => set({ activeChildNeeds: needs }),
}));
