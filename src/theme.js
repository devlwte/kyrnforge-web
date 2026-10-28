import { useCallback, useState } from 'react';

export const THEME_KEY = 'kyrnforge_theme';

function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(currentTheme);

  const toggle = useCallback(() => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Sin almacenamiento el tema dura lo que dure la pestaña.
    }
    setTheme(next);
  }, []);

  return [theme, toggle];
}
