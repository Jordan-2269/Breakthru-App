import { create } from 'zustand';
import type { ViewMode, SearchFilters } from '@/types/app';
import { DEFAULT_FILTERS } from '@/types/app';

type Coords = { latitude: number; longitude: number };

type UIStore = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  userCoords: Coords | null;
  setUserCoords: (coords: Coords | null) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  resetFilters: () => void;
};

export const useUIStore = create<UIStore>((set) => ({
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
  userCoords: null,
  setUserCoords: (coords) => set({ userCoords: coords }),
  filters: DEFAULT_FILTERS,
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
