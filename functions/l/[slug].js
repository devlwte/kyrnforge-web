// Página intermedia de los enlaces cortos: muestra el destino y continúa sola tras unos segundos.

const WAIT_SECONDS = 5;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// JSON seguro dentro de <script>: evita que un "</script>" en la URL cierre la etiqueta.
function scriptJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

const STYLE = `
  :root {
    --bg: #f6f3ee; --surface: #fffdf9; --line: #dfd8cd; --fg: #1d1b18;
    --muted: #5c574f; --dim: #8c867c; --accent: #b2521f; --accent-fg: #fffaf5;
    color-scheme: light;
  }
  :root[data-theme="dark"] {
    --bg: #131211; --surface: #1b1a18; --line: #302d29; --fg: #ece8e1;
    --muted: #a6a096; --dim: #706b63; --accent: #de8048; --accent-fg: #1c1109;
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; padding: 24px 16px;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg); color: var(--fg);
    font: 16px/1.5 "Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  main { width: 100%; max-width: 460px; }
  .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 600; }
  .brand img { width: 22px; height: 22px; }
  .card { margin-top: 20px; background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 28px 24px; }
  .eyebrow { font: 500 11px/1 "JetBrains Mono", ui-monospace, monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); margin: 0; }
  h1 { font: 400 clamp(1.9rem, 7vw, 2.4rem)/1.1 "Instrument Serif", Georgia, serif; margin: 12px 0 0; overflow-wrap: anywhere; }
  .target { margin: 14px 0 0; font: 13px/1.5 "JetBrains Mono", ui-monospace, monospace; color: var(--muted); overflow-wrap: anywhere; max-height: 4.5em; overflow: hidden; }
  .bar { margin-top: 24px; height: 3px; background: var(--line); border-radius: 99px; overflow: hidden; }
  .bar span { display: block; height: 100%; width: 100%; background: var(--accent); transform-origin: left; animation: drain ${WAIT_SECONDS}s linear forwards; }
  @keyframes drain { to { transform: scaleX(0); } }
  .go { margin-top: 18px; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px 16px; border-radius: 10px; background: var(--accent); color: var(--accent-fg); font-weight: 600; text-decoration: none; }
  .go:hover { filter: brightness(1.08); }
  .note { margin: 12px 0 0; text-align: center; font-size: 14px; color: var(--dim); }
  .note button { background: none; border: 0; padding: 0; font: inherit; color: var(--muted); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
  footer { margin-top: 18px; display: flex; justify-content: center; gap: 18px; font-size: 14px; }
  footer a { color: var(--muted); text-decoration: none; }
  footer a:hover { color: var(--fg); }
  @media (prefers-reduced-motion: reduce) { .bar span { animation: none; } }
`;

function head(title) {
  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${title}</title>
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script>
    (function () {
      var t;
      try { t = localStorage.getItem('kyrnforge_theme'); } catch (e) {}
      if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = t;
    })();
  </script>
  <style>${STYLE}</style>`;
}

const BRAND = `<a href="/" class="brand"><img src="/logo.svg" alt=""><span>KyrnForge</span></a>`;

export async function onRequest(context) {
  const { env, params } = context;
  const slug = (params.slug || '').toLowerCase();
  const kv = env?.KYRNFORGE_KV || env?.KV || env?.DB || env?.kyrnforge_kv;

  const link = kv ? await kv.get(`link_${slug}`, { type: 'json' }) : null;

  if (!link || !link.targetUrl) {
    const html = `<!doctype html>
<html lang="es">
<head>
  ${head('Enlace no disponible · KyrnForge')}
</head>
<body>
  <main>
    ${BRAND}
    <div class="card">
      <p class="eyebrow">Enlace corto</p>
      <h1>Este enlace ya no existe.</h1>
      <p class="target">Los enlaces caducan a los 90 días o se retiran si alguien los reporta.</p>
      <a class="go" href="/links">Crear uno nuevo</a>
    </div>
  </main>
</body>
</html>`;
    return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const target = escapeHtml(link.targetUrl);
  const host = escapeHtml(link.hostname || 'otro sitio');

  const html = `<!doctype html>
<html lang="es">
<head>
  ${head(`Ir a ${host} · KyrnForge`)}
</head>
<body>
  <main>
    ${BRAND}
    <div class="card">
      <p class="eyebrow">Vas a salir de KyrnForge</p>
      <h1>${host}</h1>
      <p class="target" title="${target}">${target}</p>
      <div class="bar" id="bar"><span></span></div>
      <a class="go" id="go" href="${target}" rel="noopener noreferrer">Continuar</a>
      <p class="note" id="note">Te llevo en <span id="count">${WAIT_SECONDS}</span> s · <button type="button" id="stay">Quedarme aquí</button></p>
    </div>
    <footer>
      <a href="/links">Crear un enlace</a>
      <a href="mailto:abuse@kyrnforge.dev?subject=${encodeURIComponent(`Reporte de enlace ${slug}`)}">Reportar</a>
    </footer>
  </main>
  <script>
    (function () {
      var target = ${scriptJson(link.targetUrl)};
      var left = ${WAIT_SECONDS};
      var count = document.getElementById('count');
      var timer = setInterval(function () {
        left -= 1;
        count.textContent = left;
        if (left <= 0) {
          clearInterval(timer);
          window.location.href = target;
        }
      }, 1000);
      document.getElementById('stay').addEventListener('click', function () {
        clearInterval(timer);
        document.getElementById('bar').style.visibility = 'hidden';
        document.getElementById('note').textContent = 'Redirección pausada. Usa el botón cuando quieras.';
      });
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
    },
  });
}
