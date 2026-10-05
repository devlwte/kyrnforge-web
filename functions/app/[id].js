// Cloudflare Pages Function: /app/:id
// Injects Dynamic Server-Side SEO (HTMLRewriter) for Search Engines & Social Previews

export async function onRequestGet(context) {
  try {
    const { request, env, params } = context;
    const appId = (params.id || "").toLowerCase();

    // 1. Fetch the base application HTML template
    const assetRes = await env.ASSETS.fetch(new URL('/', request.url));

    // 2. Fetch app/project metadata from Cloudflare KV (or static JSON fallback)
    const kv = env?.KYRNFORGE_KV || env?.KV || env?.DB || env?.kyrnforge_kv;
    let apps = [];
    let projects = [];

    if (kv) {
      apps = (await kv.get("available_apps", { type: "json" })) || [];
      projects = (await kv.get("projects", { type: "json" })) || [];
    }

    if (!apps.length && !projects.length && env?.ASSETS) {
      const [resApps, resProjects] = await Promise.all([
        env.ASSETS.fetch(new URL('/data/apps.json', request.url)).then(r => r.ok ? r.json() : []).catch(() => []),
        env.ASSETS.fetch(new URL('/data/projects.json', request.url)).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      apps = resApps || [];
      projects = resProjects || [];
    }

    // 3. Locate target app or project
    const app = apps.find(a => (a.id || "").toLowerCase() === appId) ||
                projects.find(p => (p.id || "").toLowerCase() === appId);

    // If app not found, serve standard SPA template
    if (!app) {
      return assetRes;
    }

    // 4. Construct rich SEO metadata
    const title = `${app.title} · Ecosistema de Software KyrnForge`;
    const description = app.description || 'Herramienta de escritorio independiente desarrollada por KyrnForge.';
    const iconUrl = app.iconImg ? (app.iconImg.startsWith('http') ? app.iconImg : `https://kyrnforge.dev${app.iconImg}`) : 'https://kyrnforge.dev/logo.svg';
    const pageUrl = `https://kyrnforge.dev/app/${app.id}`;

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

    // 5. Inject tags directly into the Edge HTML stream
    return new HTMLRewriter()
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
      .on('head', {
        element(e) {
          e.append(`\n    <script type="application/ld+json">\n    ${JSON.stringify(schemaJson, null, 2)}\n    </script>\n`, { html: true });
        }
      })
      .transform(assetRes);

  } catch (err) {
    console.error("Error in /app/[id] edge renderer:", err);
    return context.next();
  }
}
