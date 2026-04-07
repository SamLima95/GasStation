import { useEffect, useRef } from 'react';

interface Modifiers {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function useKeyboard(key: string, handler: () => void, modifiers?: Modifiers): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (modifiers?.ctrl && !e.ctrlKey && !e.metaKey) return;
      if (modifiers?.shift && !e.shiftKey) return;
      if (modifiers?.alt && !e.altKey) return;

      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handlerRef.current();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, modifiers?.ctrl, modifiers?.shift, modifiers?.alt]);
}
