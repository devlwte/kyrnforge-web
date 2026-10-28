import { normalizeAppearance } from '../src/brand.js';

export async function readAppearance(env) {
  const kv = env?.KYRNFORGE_KV || env?.KV || env?.DB || env?.kyrnforge_kv;
  if (!kv) return normalizeAppearance(null);
  try {
    const settings = await kv.get('site_settings', { type: 'json', cacheTtl: 60 });
    return normalizeAppearance(settings?.appearance);
  } catch {
    return normalizeAppearance(null);
  }
}
