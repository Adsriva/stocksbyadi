import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'sinv7';

/** Load all app data from window.storage (persists across sessions). */
export async function loadAppData() {
  if (!window.storage) return null;
  try {
    const r = await window.storage.get(STORAGE_KEY);
    return r?.value ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}

/** Save all app data to window.storage. */
export async function saveAppData(data) {
  if (!window.storage) return;
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Storage] save failed:', e.message);
  }
}

/**
 * usePersistentState — like useState but synced to window.storage.
 * Returns [state, setState, loaded].
 */
export function usePersistentState(key, defaultValue) {
  const [value, setValue]   = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    (async () => {
      if (window.storage) {
        try {
          const r = await window.storage.get(key);
          if (r?.value) setValue(JSON.parse(r.value));
        } catch {}
      }
      setLoaded(true);
      skipSave.current = false;
    })();
  }, [key]);

  useEffect(() => {
    if (skipSave.current || !loaded || !window.storage) return;
    const t = setTimeout(() => {
      window.storage.set(key, JSON.stringify(value)).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [value, loaded, key]);

  return [value, setValue, loaded];
}
