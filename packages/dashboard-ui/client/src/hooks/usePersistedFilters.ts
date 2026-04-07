import { useState, useCallback } from 'react';
import { useFiltersStore } from '../state/filters.store';

export function usePersistedFilters(pageKey: string) {
  const { saveFilter, loadFilters, deleteFilter } = useFiltersStore();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const savedSets = loadFilters(pageKey);

  const saveCurrentFilters = useCallback(
    (name: string) => {
      saveFilter(pageKey, name, filters);
    },
    [pageKey, filters, saveFilter]
  );

  const loadFilterSet = useCallback(
    (name: string) => {
      const found = savedSets.find((s) => s.name === name);
      if (found) {
        setFilters(found.values);
      }
    },
    [savedSets]
  );

  const deleteFilterSet = useCallback(
    (name: string) => {
      deleteFilter(pageKey, name);
    },
    [pageKey, deleteFilter]
  );

  return {
    filters,
    setFilters,
    savedSets,
    saveCurrentFilters,
    loadFilterSet,
    deleteFilterSet,
  };
}
