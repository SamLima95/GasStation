import { useState, useCallback } from 'react';

const STORAGE_KEY = 'gasstation_sidebar_collapsed';

function readInitial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useSidebarState() {
  const [collapsed, setCollapsedState] = useState(readInitial);

  const setCollapsed = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value));
    setCollapsedState(value);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return { collapsed, toggle, setCollapsed };
}
