// Identidad de KyrnForge: colores de acento e iconos que se eligen desde /mod → Apariencia.
// Lo usan la web, las funciones de Cloudflare (favicon y enlaces cortos) y el panel.

export const MARKS = {
  ojo: {
    name: 'Yunque con ojo',
    paths: ['M6 17H58V30H48L44 36V41H52V47H16V41H24V36L20 30Q12 30 6 17ZM48 20.5H54.5V26.5H48Z'],
  },
  chispa: {
    name: 'Yunque y chispa',
    paths: ['M6 22H58V32H48L44 38V44H52V50H16V44H24V38L20 32Q12 32 6 22Z', 'M47 6L53 12L47 18L41 12Z'],
  },
  bloque: {
    name: 'Yunque en bloques',
    paths: ['M2 18H58V28H44V38H52V46H12V38H20V28H10V23H2Z'],
  },
};

export const PALETTES = {
  acero: {
    name: 'Acero',
    note: 'Azul gris del acero templado.',
    light: { accent: '#36506e', on: '#f1f4f8' },
    dark: { accent: '#93abc9', on: '#101722' },
  },
  patina: {
    name: 'Pátina',
    note: 'El verde del cobre envejecido.',
    light: { accent: '#2f6b5e', on: '#f2f7f5' },
    dark: { accent: '#7cbfae', on: '#0e1a17' },
  },
  hierro: {
    name: 'Hierro al rojo',
    note: 'El rojo del metal caliente.',
    light: { accent: '#a3322b', on: '#fbf1f0' },
    dark: { accent: '#e3857c', on: '#210d0b' },
  },
  grafito: {
    name: 'Grafito',
    note: 'Sin color: negro sobre gris.',
    light: { accent: '#2a2d2c', on: '#f3f4f2' },
    dark: { accent: '#dfe2e0', on: '#111312' },
  },
};

export const THEMES = {
  system: 'Según el dispositivo',
  light: 'Claro',
  dark: 'Oscuro',
};

export const DEFAULT_APPEARANCE = { accent: 'acero', icon: 'ojo', theme: 'system' };

export function normalizeAppearance(value) {
  const v = value || {};
  return {
    accent: PALETTES[v.accent] ? v.accent : DEFAULT_APPEARANCE.accent,
    icon: MARKS[v.icon] ? v.icon : DEFAULT_APPEARANCE.icon,
    theme: THEMES[v.theme] ? v.theme : DEFAULT_APPEARANCE.theme,
  };
}

/// Icono de app: cuadro redondeado con el yunque en negativo.
export function tileSvg(iconId, accentId, mode = 'light') {
  const mark = MARKS[iconId] || MARKS[DEFAULT_APPEARANCE.icon];
  const colors = (PALETTES[accentId] || PALETTES[DEFAULT_APPEARANCE.accent])[mode];
  const paths = mark.paths.map((d) => `<path fill-rule="evenodd" d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="${colors.accent}"/><g fill="${colors.on}" transform="translate(9 9) scale(0.71875)">${paths}</g></svg>`;
}

export function iconHref(appearance) {
  return `/icon.svg?i=${appearance.icon}&a=${appearance.accent}`;
}
