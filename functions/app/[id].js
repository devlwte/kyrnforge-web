// Cloudflare Pages Function: /app/:id
// Injects Dynamic Server-Side SEO (HTMLRewriter) & Pre-rendered Content for Search Engines

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function onRequestGet(context) {
  try {
    const { request, env, params } = context;
    const appId = (params.id || "").toLowerCase();

    // 1. Fetch base application HTML template
    const assetRes = await env.ASSETS.fetch(new URL('/', request.url));

    // 2. Fetch apps and projects from Cloudflare KV (with static asset fallback)
    const kv = env?.KYRNFORGE_KV || env?.KV || env?.DB || env?.kyrnforge_kv;
    let apps = [];
    let projects = [];

    if (kv) {
      apps = (await kv.get("available_apps", { type: "json" })) || [];
      projects = (await kv.get("projects", { type: "json" })) || [];
    }

    let staticApps = [];
    if (env?.ASSETS) {
      try {
        const sRes = await env.ASSETS.fetch(new URL('/data/apps.json', request.url));
        if (sRes.ok) staticApps = await sRes.json();
      } catch (_) {}
    }

    if ((!apps || !apps.length) && (!projects || !projects.length)) {
      apps = staticApps || [];
      if (env?.ASSETS) {
        try {
          const resProjects = await env.ASSETS.fetch(new URL('/data/projects.json', request.url));
          if (resProjects.ok) projects = await resProjects.json();
        } catch (_) {}
      }
    }

    // 3. Locate target app or project
    const app = (apps || []).find(a => (a.id || "").toLowerCase() === appId) ||
                (projects || []).find(p => (p.id || "").toLowerCase() === appId);

    // If app not found, serve standard SPA template or 404
    if (!app) {
      return new HTMLRewriter()
        .on('title', { element(e) { e.setInnerContent('Aplicación No Encontrada · KyrnForge'); } })
        .on('meta[name="robots"]', { element(e) { e.setAttribute('content', 'noindex, nofollow'); } })
        .on('div#root', {
          element(e) {
            e.setInnerContent(`
              <div class="min-h-screen bg-[#06070a] text-zinc-100 font-sans flex flex-col items-center justify-center p-6 text-center">
                <h1 class="text-3xl font-bold font-mono text-zinc-100 mb-2">Aplicación no encontrada</h1>
                <p class="text-sm text-zinc-400 max-w-md mb-6">No existe ninguna aplicación en el ecosistema registrada con el identificador /app/${escapeHtml(appId)}.</p>
                <a href="/" class="px-5 py-2.5 rounded-xl bg-cyan-500 text-zinc-950 font-mono text-xs font-bold inline-block">Volver al Catálogo Oficial</a>
              </div>
            `, { html: true });
          }
        })
        .transform(assetRes);
    }

    // 4. Construct rich SEO metadata
    const title = `${app.title} · Ecosistema de Software KyrnForge`;
    const description = app.description || 'Herramienta de escritorio independiente desarrollada por KyrnForge.';
    const iconUrl = app.iconImg ? (app.iconImg.startsWith('http') ? app.iconImg : `https://kyrnforge.dev${app.iconImg}`) : 'https://kyrnforge.dev/logo.svg';
    const pageUrl = `https://kyrnforge.dev/app/${app.id}`;
    const badgeText = app.badge || app.statusLabel || 'v1.0.0 Oficial';
    const categoryText = app.category || app.categoryLabel || 'Herramienta de Escritorio';

    const schemaJson = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": app.title,
      "operatingSystem": "Windows 10, Windows 11",
      "applicationCategory": "DeveloperApplication",
      "description": description,
      "url": pageUrl,
      "image": iconUrl,
      "downloadUrl": app.downloadUrl || undefined,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "KyrnForge",
        "url": "https://kyrnforge.dev",
        "logo": "https://kyrnforge.dev/logo.svg"
      }
    };

    // Pre-rendered semantic HTML for Googlebot and instant initial paint
    const staticApp = (staticApps || []).find(a => (a.id || "").toLowerCase() === appId);
    const featuresList = (app.features || []).map(f => {
      const label = typeof f === 'object' ? f.label : f;
      const staticFeat = staticApp?.features?.find(sf => (sf.label || '').toLowerCase() === (label || '').toLowerCase());
      const desc = typeof f === 'object' && f.description ? String(f.description).trim() : (staticFeat?.description || '');
      return `<li class="p-4 rounded-xl bg-[#080b12] border border-zinc-800 text-zinc-300 text-xs font-mono space-y-1">
        <div class="flex items-center space-x-2 font-bold text-zinc-100">
          <span class="text-cyan-400">✓</span>
          <span>${escapeHtml(label)}</span>
        </div>
        ${desc ? `<p class="text-[11px] text-zinc-400 font-sans leading-relaxed pl-5">${escapeHtml(desc)}</p>` : ''}
      </li>`;
    }).join('');

    const preRenderedAppHtml = `
      <div class="min-h-screen bg-[#06070a] text-zinc-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
        <header class="border-b border-zinc-900 bg-[#06070a]/90 backdrop-blur-xl">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <nav class="flex items-center space-x-3 text-xs font-mono text-zinc-400" aria-label="Breadcrumb">
              <a href="/" class="hover:text-cyan-400 text-zinc-300 flex items-center space-x-1">
                <span>←</span>
                <span>Ecosistema</span>
              </a>
              <span class="text-zinc-600">/</span>
              <span>Apps</span>
              <span class="text-zinc-600">/</span>
              <span class="text-zinc-100 font-bold">${escapeHtml(app.title)}</span>
            </nav>
            <a href="/" class="text-xs font-mono text-cyan-400 hover:underline">kyrnforge.dev</a>
          </div>
        </header>

        <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
          <section class="p-6 sm:p-10 rounded-3xl bg-[#080b12] border border-zinc-800/90 relative shadow-2xl">
            <div class="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-10">
              <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-[#0c101c] border border-zinc-700/60 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xl">
                <img src="${escapeHtml(iconUrl)}" alt="${escapeHtml(app.title)}" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0 space-y-3">
                <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span class="px-2.5 py-0.5 rounded-full border border-emerald-500/40 text-emerald-400 bg-emerald-950/30">${escapeHtml(badgeText)}</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">${escapeHtml(categoryText)}</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-cyan-950/30 text-cyan-300 border border-cyan-500/20">Verificado</span>
                </div>
                <h1 class="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">${escapeHtml(app.title)}</h1>
                <p class="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">${escapeHtml(description)}</p>
                <div class="flex flex-wrap items-center gap-3 pt-2">
                  ${app.downloadUrl ? `
                    <a href="${escapeHtml(app.downloadUrl)}" class="px-6 py-3 rounded-xl bg-cyan-500 text-zinc-950 font-mono text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25">
                      ${escapeHtml(app.downloadLabel || 'DESCARGAR SETUP')}
                    </a>
                  ` : ''}
                  ${app.repoUrl ? `
                    <a href="${escapeHtml(app.repoUrl)}" target="_blank" rel="noopener noreferrer" class="px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-200 font-mono text-xs sm:text-sm">
                      Ver Repositorio GitHub ↗
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>
          </section>

          ${featuresList ? `
          <section class="space-y-4">
            <h2 class="text-sm font-mono text-zinc-400 uppercase tracking-wider">Capacidades Principales &amp; Arquitectura</h2>
            <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${featuresList}
            </ul>
          </section>
          ` : ''}

          <section class="p-6 sm:p-8 rounded-2xl bg-[#090c14] border border-zinc-800/80 space-y-4">
            <h2 class="text-sm font-mono text-zinc-300 uppercase tracking-wider">Ficha Técnica &amp; Soberanía Local</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div class="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900">
                <span class="text-zinc-500 block text-[10px]">ARQUITECTURA</span>
                <span class="font-bold text-zinc-200">Rust Core / Tauri v2</span>
              </div>
              <div class="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900">
                <span class="text-zinc-500 block text-[10px]">LICENCIA</span>
                <span class="font-bold text-emerald-400">Freeware Oficial</span>
              </div>
              <div class="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900">
                <span class="text-zinc-500 block text-[10px]">PRIVACIDAD</span>
                <span class="font-bold text-cyan-400">100% Local (Zero Leaks)</span>
              </div>
              <div class="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900">
                <span class="text-zinc-500 block text-[10px]">PLATAFORMA</span>
                <span class="font-bold text-purple-400">Windows 10 / 11</span>
              </div>
            </div>
          </section>
        </main>

        <footer class="border-t border-zinc-900 py-8 text-center text-xs font-mono text-zinc-500 mt-16">
          <p>© 2026 KyrnForge · <a href="/" class="text-cyan-400 underline">Volver al Inicio</a></p>
        </footer>
      </div>
    `;

    // 5. Transform stream at Cloudflare Edge
    const response = new HTMLRewriter()
      .on('title', {
        element(e) { e.setInnerContent(title); }
      })
      .on('meta[name="title"]', {
        element(e) { e.setAttribute('content', title); }
      })
      .on('meta[name="description"]', {
        element(e) { e.setAttribute('content', description); }
      })
      .on('meta[property="og:title"]', {
        element(e) { e.setAttribute('content', title); }
      })
      .on('meta[property="og:description"]', {
        element(e) { e.setAttribute('content', description); }
      })
      .on('meta[property="og:url"]', {
        element(e) { e.setAttribute('content', pageUrl); }
      })
      .on('meta[property="og:image"]', {
        element(e) { e.setAttribute('content', iconUrl); }
      })
      .on('meta[name="twitter:title"]', {
        element(e) { e.setAttribute('content', title); }
      })
      .on('meta[name="twitter:description"]', {
        element(e) { e.setAttribute('content', description); }
      })
      .on('meta[name="twitter:url"]', {
        element(e) { e.setAttribute('content', pageUrl); }
      })
      .on('meta[name="twitter:image"]', {
        element(e) { e.setAttribute('content', iconUrl); }
      })
      .on('link[rel="canonical"]', {
        element(e) { e.setAttribute('href', pageUrl); }
      })
      .on('script#schema-graph', {
        element(e) {
          e.setInnerContent(`\n    ${JSON.stringify(schemaJson, null, 2)}\n    `);
        }
      })
      .on('div#root', {
        element(e) {
          e.setInnerContent(preRenderedAppHtml, { html: true });
        }
      })
      .transform(assetRes);

    return new Response(response.body, {
      status: 200,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });

  } catch (err) {
    console.error("Error in /app/[id] edge renderer:", err);
    return context.next();
  }
}
