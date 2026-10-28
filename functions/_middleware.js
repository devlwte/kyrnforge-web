// Aplica la apariencia guardada (color, icono y tema por defecto) a cada página HTML antes de enviarla,
// para que el primer pintado ya salga con los colores correctos.
import { iconHref } from '../src/brand.js';
import { readAppearance } from './appearance-utils.js';

export async function onRequest({ request, env, next }) {
  const response = await next();
  const type = response.headers.get('Content-Type') || '';
  if (request.method !== 'GET' || !type.includes('text/html')) return response;

  const appearance = await readAppearance(env);
  return new HTMLRewriter()
    .on('html', {
      element(e) {
        e.setAttribute('data-accent', appearance.accent);
        e.setAttribute('data-default-theme', appearance.theme);
      },
    })
    .on('link[rel="icon"]', {
      element(e) {
        e.setAttribute('href', iconHref(appearance));
      },
    })
    .transform(response);
}
