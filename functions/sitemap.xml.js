// Cloudflare Pages Function: /sitemap.xml
// Dynamically generates the sitemap containing all apps and projects from Cloudflare KV

export async function onRequestGet(context) {
  try {
    const { env, request } = context;
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

    // Deduplicate app IDs
    const seenIds = new Set();
    const appEntries = [];

    for (const item of [...apps, ...projects]) {
      if (item && item.id && !seenIds.has(item.id.toLowerCase())) {
        seenIds.add(item.id.toLowerCase());
        appEntries.push(item.id.toLowerCase());
      }
    }

    const today = new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kyrnforge.dev/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${appEntries.map(id => `  <url>
    <loc>https://kyrnforge.dev/app/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });

  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kyrnforge.dev/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`, {
      headers: { "Content-Type": "application/xml; charset=UTF-8" }
    });
  }
}
