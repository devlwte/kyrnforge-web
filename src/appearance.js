import { createContext, useContext } from 'react';
import { DEFAULT_APPEARANCE, iconHref, normalizeAppearance } from './brand';
import { THEME_KEY } from './theme';

const CACHE_KEY = 'kyrnforge_appearance';

export const AppearanceContext = createContext(DEFAULT_APPEARANCE);

export const useAppearance = () => useContext(AppearanceContext);

export function cachedAppearance() {
  try {
    return normalizeAppearance(JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'));
  } catch {
    return normalizeAppearance(document.documentElement.dataset);
  }
}

/// Aplica color, icono y tema por defecto a la página. El tema elegido por el visitante manda sobre el de por defecto.
export function applyAppearance(value) {
  const appearance = normalizeAppearance(value);
  const root = document.documentElement;
  root.dataset.accent = appearance.accent;

  let chosen = null;
  try {
    chosen = localStorage.getItem(THEME_KEY);
    localStorage.setItem(CACHE_KEY, JSON.stringify(appearance));
  } catch {
    // Sin almacenamiento solo se aplica a esta visita.
  }
  if (chosen !== 'light' && chosen !== 'dark') {
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = appearance.theme === 'system' ? (systemDark ? 'dark' : 'light') : appearance.theme;
  }

  const link = document.querySelector('link[rel="icon"]');
  if (link) link.href = iconHref(appearance);
  return appearance;
}
