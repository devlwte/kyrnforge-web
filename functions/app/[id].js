// Cloudflare Pages Function: /app/:id
// Rellena las metaetiquetas y un contenido inicial de la ficha para buscadores y primera pintura.

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
      const notFound = new HTMLRewriter()
        .on('title', { element(e) { e.setInnerContent('No encontrado · KyrnForge'); } })
        .on('meta[name="robots"]', { element(e) { e.setAttribute('content', 'noindex, nofollow'); } })
        .on('div#root', {
          element(e) {
            e.setInnerContent(`
              <main class="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
                <p class="eyebrow">404</p>
                <h1 class="font-serif text-4xl">No encontré esa creación</h1>
                <p class="text-muted">No hay nada publicado en /app/${escapeHtml(appId)}.</p>
                <a href="/#creaciones" class="btn-primary">Ver el catálogo</a>
              </main>
            `, { html: true });
          }
        })
        .transform(assetRes);
      return new Response(notFound.body, { status: 404, headers: notFound.headers });
    }

    // 4. Construct rich SEO metadata
    const title = `${app.title} · KyrnForge`;
    const description = app.description || 'Herramienta de escritorio independiente desarrollada por KyrnForge.';
    const iconUrl = app.iconImg ? (app.iconImg.startsWith('http') ? app.iconImg : `https://kyrnforge.dev${app.iconImg}`) : 'https://kyrnforge.dev/logo.svg';
    const pageUrl = `https://kyrnforge.dev/app/${app.id}`;
    const versionText = String(app.badge || app.statusLabel || '').replace(/\s*(oficial|estable)\s*$/i, '').trim();
    const categoryText = app.category || app.categoryLabel || '';
    const downloadUrl = app.downloadUrl || (app.repoUrl ? `${app.repoUrl}/releases` : '');

    const schemaJson = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": app.title,
      "operatingSystem": app.system ? String(app.system).split('·')[0].trim() : "Windows",
      "applicationCategory": "DeveloperApplication",
      "description": description,
      "url": pageUrl,
      "image": iconUrl,
      "downloadUrl": downloadUrl || undefined,
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

    const staticApp = (staticApps || []).find(a => (a.id || "").toLowerCase() === appId);
    const traits = (app.features || app.tags || []).map(f => {
      const label = typeof f === 'object' ? (f.label || f.name || '') : f;
      const staticFeat = staticApp?.features?.find(sf => (sf.label || '').toLowerCase() === (label || '').toLowerCase());
      const desc = typeof f === 'object' && f.description ? String(f.description).trim() : (staticFeat?.description || '');
      return `<li class="py-4"><strong class="font-medium">${escapeHtml(label)}</strong>${desc ? `<p class="text-muted">${escapeHtml(desc)}</p>` : ''}</li>`;
    }).join('');
    const meta = [categoryText, versionText].filter(Boolean).map(escapeHtml).join(' · ');

    const preRenderedAppHtml = `
      <header class="border-b border-line">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <a href="/" class="font-semibold">KyrnForge</a>
        </div>
      </header>
      <main class="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <a href="/#creaciones" class="text-sm text-muted">← Creaciones</a>
        <section class="flex flex-col sm:flex-row gap-6 sm:items-center">
          <img src="${escapeHtml(iconUrl)}" alt="" class="w-24 h-24 rounded-3xl border border-line" />
          <div class="space-y-2">
            ${meta ? `<p class="eyebrow">${meta}</p>` : ''}
            <h1 class="font-serif text-4xl sm:text-5xl">${escapeHtml(app.title)}</h1>
          </div>
        </section>
        <p class="text-lg text-muted leading-relaxed max-w-2xl">${escapeHtml(description)}</p>
        <div class="flex flex-wrap gap-3">
          ${downloadUrl ? `<a href="${escapeHtml(downloadUrl)}" rel="noopener noreferrer" class="btn-primary">Descargar</a>` : ''}
          ${app.repoUrl ? `<a href="${escapeHtml(app.repoUrl)}" rel="noopener noreferrer" class="btn-ghost">Código fuente</a>` : ''}
        </div>
        ${traits ? `
        <section class="space-y-4 max-w-2xl">
          <h2 class="text-xl font-semibold">Qué hace</h2>
          <ul class="divide-y divide-line border-y border-line">${traits}</ul>
        </section>` : ''}
      </main>
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
