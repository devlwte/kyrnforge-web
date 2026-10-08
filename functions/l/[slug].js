// Cloudflare Pages Function: /l/[slug]
// Clean, Soft Minimalist Interstitial Redirect Page with High-Viewability Non-Intrusive Ad Banner

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function onRequest(context) {
  const { request, env, params } = context;
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0; padding: 0;
      background-color: #0d0f14;
      color: #94a3b8;
      font-family: 'Inter', -apple-system, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #141721;
      border: 1px solid #222738;
      border-radius: 20px;
      padding: 36px 32px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    h1 { color: #f1f5f9; font-size: 1.25rem; font-weight: 600; margin: 0 0 8px 0; }
    p { font-size: 0.875rem; line-height: 1.5; color: #94a3b8; margin: 0 0 24px 0; }
    a.btn {
      display: inline-block;
      background: #4f46e5;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 12px;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }
    a.btn:hover { background: #4338ca; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 2.2rem; margin-bottom: 12px;">🔗</div>
    <h1>Enlace no disponible</h1>
    <p>El enlace corto que intentas abrir no existe, ha expirado o fue removido por políticas de seguridad.</p>
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
  const safeTitle = escapeHtml(link.title || link.hostname || 'Destino Verificado');

  // Interstitial Page with Fresh, Soft Minimalist Design and Strategic Non-Intrusive Ad
  const pageHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Redirigiendo a ${safeHostname} · Kyrn Links</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --bg: #0c0e14;
      --card-bg: #141722;
      --card-subtle: #191d2a;
      --border: #212638;
      --border-hover: #2e354d;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --emerald: #10b981;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px 16px;
      background-color: var(--bg);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1.5;
    }

    .wrapper {
      max-width: 520px;
      width: 100%;
      margin: auto;
    }

    /* Soft Minimalist Brand Header */
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 20px;
      text-decoration: none;
    }
    .brand-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: #1e2333;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #818cf8;
      font-size: 14px;
      border: 1px solid var(--border);
    }
    .brand-name {
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--text-muted);
    }
    .brand-tag {
      font-size: 0.65rem;
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(99, 102, 241, 0.12);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.25);
      font-weight: 500;
    }

    /* Main Destination Card */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px 24px;
      box-shadow: 0 20px 45px -10px rgba(0,0,0,0.45);
      text-align: center;
      position: relative;
    }

    .shield-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 0.72rem;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .destination-box {
      background: var(--card-subtle);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 20px;
      text-align: left;
    }
    .destination-label {
      font-size: 0.7rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .destination-url {
      font-size: 0.95rem;
      color: var(--text-main);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .destination-icon {
      font-size: 1.1rem;
      color: #818cf8;
      flex-shrink: 0;
    }

    /* --- STRATEGIC AD CONTAINER (High Viewability & Soft Integration) --- */
    .ad-container {
      background: #11141d;
      border: 1px solid #1f2536;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 22px;
      text-align: left;
      position: relative;
    }
    .ad-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .ad-label {
      font-size: 0.65rem;
      color: var(--text-dim);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 600;
    }
    .ad-pill {
      font-size: 0.62rem;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(255,255,255,0.05);
      color: var(--text-dim);
    }
    
    /* Simulated Dev Banner (Clean, attractive, converts well) */
    .simulated-ad {
      display: flex;
      gap: 14px;
      align-items: center;
      text-decoration: none;
      color: inherit;
      padding: 6px;
      border-radius: 10px;
      transition: background 0.2s;
    }
    .simulated-ad:hover {
      background: rgba(255,255,255,0.03);
    }
    .simulated-ad-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3730a3, #4f46e5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
    }
    .simulated-ad-content {
      flex: 1;
      min-width: 0;
    }
    .simulated-ad-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 2px;
    }
    .simulated-ad-desc {
      font-size: 0.75rem;
      color: #94a3b8;
      line-height: 1.35;
    }

    /* Action & Countdown */
    .action-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .continue-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 13px 20px;
      background: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: 14px;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
    }
    .continue-btn:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .continue-btn.waiting {
      background: #2a3147;
      color: #94a3b8;
      box-shadow: none;
      cursor: wait;
    }

    /* Progress timer bar */
    .timer-bar-track {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.06);
      border-radius: 999px;
      overflow: hidden;
      margin-top: -4px;
      margin-bottom: 4px;
    }
    .timer-bar-fill {
      height: 100%;
      width: 100%;
      background: #6366f1;
      transition: width 3.5s linear;
    }

    .footer-links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 18px;
      font-size: 0.72rem;
      color: var(--text-dim);
    }
    .footer-links a {
      color: var(--text-dim);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Brand -->
    <a href="/links" class="brand">
      <div class="brand-icon">🔗</div>
      <span class="brand-name">Kyrn Links</span>
      <span class="brand-tag">Verificado</span>
    </a>

    <!-- Card -->
    <div class="card">
      <div class="shield-badge">
        <span>✓</span>
        <span>Enlace libre de spam y contenido para adultos</span>
      </div>

      <div class="destination-box">
        <div class="destination-label">Destino verificado</div>
        <div class="destination-url" title="${safeTarget}">
          <span class="destination-icon">↗</span>
          <span>${safeHostname}</span>
        </div>
      </div>

      <!-- AD BANNER CONTAINER -->
      <div class="ad-container">
        <div class="ad-header">
          <span class="ad-label">Patrocinado · Espacio Desarrollador</span>
          <span class="ad-pill">Publicidad Ética</span>
        </div>

        <!-- 
          SIMULACRO DE ANUNCIO:
          Para cambiar a EthicalAds cuando tengas tu ID, sustituye esto por:
          <div data-ea-publisher="TU_PUBLISHER_ID" data-ea-type="image"></div>
          <script async src="https://media.ethicalads.io/media/client/ethicalads.min.js"></script>
        -->
        <a href="https://kyrnforge.dev" target="_blank" rel="noopener sponsored" class="simulated-ad">
          <div class="simulated-ad-icon">⚡</div>
          <div class="simulated-ad-content">
            <div class="simulated-ad-title">Kyrn DevDock · Monitor de Red &amp; Puertos</div>
            <div class="simulated-ad-desc">Herramienta nativa ultraligera en Rust para Windows. Diagnostica sockets y puertos en tiempo real sin telemetría.</div>
          </div>
        </a>
      </div>

      <!-- Action & Auto-redirect -->
      <div class="action-group">
        <div class="timer-bar-track">
          <div id="bar-fill" class="timer-bar-fill"></div>
        </div>
        <a id="go-btn" href="${safeTarget}" class="continue-btn waiting">
          <span>Accediendo en <strong id="countdown">3</strong>s...</span>
        </a>
      </div>

      <div class="footer-links">
        <a href="${safeTarget}">Saltar espera</a>
        <span>·</span>
        <a href="/links">Crear enlace</a>
        <span>·</span>
        <a href="mailto:abuse@kyrnforge.dev?subject=Reporte%20de%20enlace%20${slug}" title="Reportar si infringe normas">Reportar</a>
      </div>
    </div>
  </div>

  <script>
    (function() {
      var target = ${JSON.stringify(link.targetUrl)};
      var seconds = 3;
      var countdownEl = document.getElementById('countdown');
      var btn = document.getElementById('go-btn');
      var bar = document.getElementById('bar-fill');

      // Animate progress bar to 0%
      setTimeout(function() {
        if (bar) bar.style.width = '0%';
      }, 50);

      var interval = setInterval(function() {
        seconds--;
        if (countdownEl) countdownEl.textContent = seconds;
        if (seconds <= 0) {
          clearInterval(interval);
          btn.classList.remove('waiting');
          btn.innerHTML = '<span>Continuar a ' + ${JSON.stringify(safeHostname)} + ' →</span>';
          // Auto-redirect smooth
          window.location.href = target;
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
