// Cloudflare Pages Function: /l/[slug]
// Clean, Modern Interstitial Landing Page with Light/Dark Mode, 5s Countdown & Prominent Ad Placement

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function onRequest(context) {
  const { env, params } = context;
  const slug = (params.slug || '').toLowerCase();
  const kv = env?.KYRNFORGE_KV || env?.KV || env?.DB || env?.kyrnforge_kv;

  let link = null;
  if (kv) {
    link = await kv.get(`link_${slug}`, { type: 'json' });
  }

  // Fallback / Not Found Template
  if (!link || !link.targetUrl) {
    const notFoundHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Enlace no encontrado · Kyrn Links</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card: #111625;
      --border: #1e263d;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --primary: #4f46e5;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f8fafc;
        --card: #ffffff;
        --border: #e2e8f0;
        --text: #0f172a;
        --text-muted: #64748b;
        --primary: #4f46e5;
      }
    }
    body {
      margin: 0; padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 36px 30px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    h1 { font-size: 1.25rem; font-weight: 700; margin: 12px 0 8px 0; }
    p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 24px 0; }
    a.btn {
      display: inline-block;
      background: var(--primary);
      color: #ffffff;
      padding: 11px 22px;
      border-radius: 12px;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 2.2rem;">🔗</div>
    <h1>Enlace no disponible</h1>
    <p>El enlace corto no existe, ha expirado tras 90 días o fue removido por políticas de seguridad.</p>
    <a href="/links" class="btn">Crear un nuevo enlace</a>
  </div>
</body>
</html>`;

    return new Response(notFoundHtml, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  const safeTarget = escapeHtml(link.targetUrl);
  const safeHostname = escapeHtml(link.hostname || 'Enlace externo');

  const pageHtml = `<!doctype html>
<html lang="es" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Continuar a ${safeHostname} · Kyrn Links</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    :root[data-theme="dark"] {
      --bg: #090d16;
      --card: #111625;
      --card-sub: #161c2e;
      --border: #1e263d;
      --border-light: #283350;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --emerald: #10b981;
      --ad-bg: #0d121f;
      --ad-border: #222c44;
      --ad-title: #ffffff;
      --btn-waiting: #1e263d;
      --btn-waiting-text: #94a3b8;
      --shadow: rgba(0, 0, 0, 0.4);
    }

    :root[data-theme="light"] {
      --bg: #f8fafc;
      --card: #ffffff;
      --card-sub: #f1f5f9;
      --border: #e2e8f0;
      --border-light: #cbd5e1;
      --text: #0f172a;
      --text-muted: #64748b;
      --text-dim: #94a3b8;
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --emerald: #059669;
      --ad-bg: #f8fafc;
      --ad-border: #e2e8f0;
      --ad-title: #0f172a;
      --btn-waiting: #e2e8f0;
      --btn-waiting-text: #64748b;
      --shadow: rgba(15, 23, 42, 0.08);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px 16px;
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1.5;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .wrapper {
      max-width: 540px;
      width: 100%;
      margin: auto;
    }

    /* Top Navigation bar */
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
    }
    .brand-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 14px;
    }
    .brand-title {
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .brand-tag {
      font-size: 0.65rem;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.12);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.25);
      font-weight: 600;
    }

    /* Theme Toggle Button */
    .theme-toggle-btn {
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text-muted);
      border-radius: 10px;
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .theme-toggle-btn:hover {
      border-color: var(--border-light);
      color: var(--text);
    }

    /* Main Card */
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 30px 26px;
      box-shadow: 0 20px 45px -10px var(--shadow);
      text-align: center;
      transition: all 0.2s ease;
    }

    /* Safety & Destination Box */
    .dest-card {
      background: var(--card-sub);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px 18px;
      margin-bottom: 22px;
      text-align: left;
    }
    .dest-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .dest-tag {
      font-size: 0.7rem;
      color: var(--text-dim);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .dest-badge {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--emerald);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .dest-url {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* --- PROMINENT HIGH-VISIBILITY ADVERTISEMENT BANNER --- */
    .ad-banner-box {
      background: var(--ad-bg);
      border: 1px solid var(--ad-border);
      border-radius: 18px;
      padding: 18px;
      margin-bottom: 24px;
      text-align: left;
      position: relative;
    }
    .ad-banner-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    .ad-sponsor-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-dim);
    }
    .ad-sponsor-badge {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(79, 70, 229, 0.12);
      color: #818cf8;
      border: 1px solid rgba(79, 70, 229, 0.25);
    }

    /* Simulated Prominent Ad (300x250 or Responsive Banner) */
    .ad-content-link {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }
    .ad-main-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .ad-icon-badge {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #4f46e5, #3730a3);
      color: #ffffff;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
    }
    .ad-info {
      flex: 1;
      min-width: 0;
    }
    .ad-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--ad-title);
      margin-bottom: 3px;
      line-height: 1.3;
    }
    .ad-desc {
      font-size: 0.78rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .ad-cta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 4px;
    }
    .ad-tagline {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-dim);
    }
    .ad-cta-btn {
      padding: 5px 12px;
      border-radius: 8px;
      background: rgba(79, 70, 229, 0.15);
      border: 1px solid rgba(79, 70, 229, 0.3);
      color: #818cf8;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* Timer & Action Button */
    .timer-container {
      margin-bottom: 8px;
    }
    .timer-track {
      width: 100%;
      height: 6px;
      background: var(--border);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .timer-fill {
      height: 100%;
      width: 100%;
      background: var(--primary);
      border-radius: 999px;
      transition: width 5s linear;
    }

    /* Main Jump Button */
    .jump-btn {
      width: 100%;
      padding: 15px 22px;
      border-radius: 16px;
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }
    .jump-btn.waiting {
      background: var(--btn-waiting);
      color: var(--btn-waiting-text);
      cursor: wait;
      pointer-events: none;
    }
    .jump-btn.ready {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
      cursor: pointer;
      pointer-events: auto;
      animation: pulseBtn 2s infinite;
    }
    .jump-btn.ready:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    @keyframes pulseBtn {
      0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.5); }
      70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }

    .footer-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
      font-size: 0.75rem;
      color: var(--text-dim);
    }
    .footer-actions a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .footer-actions a:hover {
      color: var(--text);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    
    <!-- Top Bar with Theme Switcher -->
    <div class="header-bar">
      <a href="/links" class="brand">
        <div class="brand-icon">🔗</div>
        <span class="brand-title">Kyrn Links</span>
        <span class="brand-tag">Verificado</span>
      </a>

      <button id="theme-btn" class="theme-toggle-btn" aria-label="Cambiar tema">
        <span id="theme-icon">☀️</span>
        <span id="theme-label">Claro</span>
      </button>
    </div>

    <!-- Main Card -->
    <div class="card">
      
      <!-- Destination Summary -->
      <div class="dest-card">
        <div class="dest-header">
          <span class="dest-tag">Destino Verificado</span>
          <span class="dest-badge">✓ Libre de contenido para adultos</span>
        </div>
        <div class="dest-url" title="${safeTarget}">
          <span>↗</span>
          <span>${safeHostname}</span>
        </div>
      </div>

      <!-- PROMINENT ADVERTISEMENT BANNER -->
      <div class="ad-banner-box">
        <div class="ad-banner-header">
          <span class="ad-sponsor-label">Anuncio Patrocinado</span>
          <span class="ad-sponsor-badge">Publicidad para Desarrolladores</span>
        </div>

        <!-- 
          ESPACIO DE ANUNCIO:
          Para EthicalAds:
          <div data-ea-publisher="TU_PUBLISHER_ID" data-ea-type="image"></div>
          <script async src="https://media.ethicalads.io/media/client/ethicalads.min.js"></script>

          Para Carbon Ads:
          <script async src="//cdn.carbonads.com/carbon.js?serve=TU_SERVE_ID&placement=kyrnforge" id="_carbonads_js"></script>
        -->
        <a href="https://kyrnforge.dev" target="_blank" rel="noopener sponsored" class="ad-content-link">
          <div class="ad-main-row">
            <div class="ad-icon-badge">⚡</div>
            <div class="ad-info">
              <div class="ad-title">Servidores Cloud NVMe &amp; VPS Ultrarrápidos</div>
              <div class="ad-desc">Despliega microservicios y proyectos en 55 segundos. Alto rendimiento, discos NVMe y tráfico ilimitado para developers.</div>
            </div>
          </div>
          <div class="ad-cta-row">
            <span class="ad-tagline">Recomendado por la comunidad técnica</span>
            <span class="ad-cta-btn">Ver Ofertas →</span>
          </div>
        </a>
      </div>

      <!-- Timer & Jump Action -->
      <div class="timer-container">
        <div class="timer-track">
          <div id="bar-fill" class="timer-fill"></div>
        </div>

        <button id="jump-btn" class="jump-btn waiting">
          <span>Esperando... (<strong id="countdown">5</strong>s)</span>
        </button>
      </div>

      <div class="footer-actions">
        <a id="skip-link" href="${safeTarget}">Saltar espera ahora</a>
        <span>·</span>
        <a href="/links">Crear mi enlace</a>
        <span>·</span>
        <a href="mailto:abuse@kyrnforge.dev?subject=Reporte%20de%20enlace%20${slug}" title="Reportar contenido inapropiado">Reportar</a>
      </div>

    </div>
  </div>

  <script>
    (function() {
      var target = ${JSON.stringify(link.targetUrl)};
      var seconds = 5;
      var countdownEl = document.getElementById('countdown');
      var jumpBtn = document.getElementById('jump-btn');
      var bar = document.getElementById('bar-fill');
      var themeBtn = document.getElementById('theme-btn');
      var themeIcon = document.getElementById('theme-icon');
      var themeLabel = document.getElementById('theme-label');
      var root = document.documentElement;

      // 1. Theme initialization & toggle (supports Light & Dark modes)
      var savedTheme = localStorage.getItem('kyrn_links_theme_v1');
      if (savedTheme) {
        root.setAttribute('data-theme', savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        root.setAttribute('data-theme', 'light');
      }

      function updateThemeButtonUI() {
        var current = root.getAttribute('data-theme');
        if (current === 'light') {
          themeIcon.textContent = '🌙';
          themeLabel.textContent = 'Oscuro';
        } else {
          themeIcon.textContent = '☀️';
          themeLabel.textContent = 'Claro';
        }
      }
      updateThemeButtonUI();

      themeBtn.addEventListener('click', function() {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        localStorage.setItem('kyrn_links_theme_v1', next);
        updateThemeButtonUI();
      });

      // 2. Animate countdown progress bar
      setTimeout(function() {
        if (bar) bar.style.width = '0%';
      }, 50);

      // 3. Countdown timer logic (Standard 5 seconds)
      var interval = setInterval(function() {
        seconds--;
        if (countdownEl) countdownEl.textContent = seconds;
        
        if (seconds <= 0) {
          clearInterval(interval);
          jumpBtn.classList.remove('waiting');
          jumpBtn.classList.add('ready');
          jumpBtn.innerHTML = '<span>CONTINUAR AL DESTINO AHORA →</span>';

          // When button is clicked, jump to destination URL
          jumpBtn.addEventListener('click', function() {
            window.location.href = target;
          });
        }
      }, 1000);

    })();
  </script>
</body>
</html>`;

  return new Response(pageHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800'
    }
  });
}
