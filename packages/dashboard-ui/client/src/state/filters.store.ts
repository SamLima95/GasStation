import { create } from 'zustand';

const STORAGE_KEY = 'gasstation_saved_filters';

interface FilterSet {
  name: string;
  values: Record<string, string>;
}

interface FiltersState {
  savedFilters: Record<string, FilterSet[]>;
  saveFilter: (page: string, name: string, values: Record<string, string>) => void;
  loadFilters: (page: string) => FilterSet[];
  deleteFilter: (page: string, name: string) => void;
}

function readFromStorage(): Record<string, FilterSet[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeToStorage(data: Record<string, FilterSet[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  savedFilters: readFromStorage(),

  saveFilter: (page: string, name: string, values: Record<string, string>) => {
    const current = { ...get().savedFilters };
    const pageFilters = current[page] || [];
    const existing = pageFilters.findIndex((f) => f.name === name);

    if (existing >= 0) {
      pageFilters[existing] = { name, values };
    } else {
      pageFilters.push({ name, values });
    }

    current[page] = pageFilters;
    writeToStorage(current);
    set({ savedFilters: current });
  },

  loadFilters: (page: string) => {
    return get().savedFilters[page] || [];
  },

  deleteFilter: (page: string, name: string) => {
    const current = { ...get().savedFilters };
    current[page] = (current[page] || []).filter((f) => f.name !== name);
    writeToStorage(current);
    set({ savedFilters: current });
  },
}));
