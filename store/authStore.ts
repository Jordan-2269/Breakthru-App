import { create } from 'zustand';
import type { UserRole } from '@/types/app';

type AuthStore = {
  isHydrated: boolean;
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isHydrated: false,
  setHydrated: (v) => set({ isHydrated: v }),
}));
