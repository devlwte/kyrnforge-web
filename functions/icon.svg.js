// Cloudflare Pages Function: /icon.svg
// Favicon con el icono y el color elegidos en /mod → Apariencia (o los indicados por ?i= y ?a=).
import { normalizeAppearance, tileSvg } from '../src/brand.js';
import { readAppearance } from './appearance-utils.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const query = { icon: url.searchParams.get('i'), accent: url.searchParams.get('a') };
  const saved = query.icon && query.accent ? {} : await readAppearance(env);
  const appearance = normalizeAppearance({ ...saved, ...Object.fromEntries(Object.entries(query).filter(([, v]) => v)) });

  return new Response(tileSvg(appearance.icon, appearance.accent), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': query.icon && query.accent ? 'public, max-age=86400' : 'public, max-age=300',
    },
  });
}
