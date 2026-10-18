import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'shoesduoc-theme';
const DARK_CLASS = 'ion-palette-dark';

function getStoredTheme(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark');
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.setAttribute('content', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Aplica el tema guardado (por defecto claro) al arrancar la app. */
export function initTheme() {
  applyTheme(getStoredTheme());
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() =>
    document.documentElement.classList.contains(DARK_CLASS) ? 'dark' : getStoredTheme(),
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
}
