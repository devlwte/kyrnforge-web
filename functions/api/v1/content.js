// Cloudflare Pages Function: /api/v1/content
// Supports GET (retrieve full site data) and POST (save full site data or individual sections)

export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const kv = env?.KYRNFORGE_KV || env?.KV || env?.DB || env?.kyrnforge_kv;

    // 1. If Cloudflare KV database is configured
    if (kv) {
      const apps = await kv.get("available_apps", { type: "json" });
      const projects = await kv.get("projects", { type: "json" });
      const siteSettings = await kv.get("site_settings", { type: "json" });

      if (apps || projects || siteSettings) {
        return new Response(JSON.stringify({
          source: "cloudflare-kv",
          database: { connected: true, type: "Cloudflare KV" },
          availableApps: apps || null,
          projects: projects || null,
          siteSettings: siteSettings || null
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
          }
        });
      }
    }

    // 2. Fallback to static JSON files
    if (env && env.ASSETS) {
      const [resApps, resProjects, resSettings] = await Promise.all([
        env.ASSETS.fetch(new URL('/data/apps.json', request.url)).then(r => r.ok ? r.json() : null).catch(() => null),
        env.ASSETS.fetch(new URL('/data/projects.json', request.url)).then(r => r.ok ? r.json() : null).catch(() => null),
        env.ASSETS.fetch(new URL('/data/settings.json', request.url)).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      return new Response(JSON.stringify({
        source: "edge-static-json",
        database: { connected: false, type: "none" },
        availableApps: resApps,
        projects: resProjects,
        siteSettings: resSettings
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
        }
      });
    }

    return new Response(JSON.stringify({
      source: "edge-defaults",
      database: { connected: false, type: "none" },
      message: "Operando con datos estaticos predeterminados del servidor."
    }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const authHeader = request.headers.get("Authorization") || request.headers.get("x-admin-key") || "";
    const cleanAuth = authHeader.replace("Bearer ", "").trim();

    if (cleanAuth !== "kyrnforge2026" && cleanAuth !== "admin") {
      return new Response(JSON.stringify({
        success: false,
        error: "No autorizado. Clave de administrador incorrecta."
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const payload = await request.json().catch(() => null);
    if (!payload) {
      return new Response(JSON.stringify({ success: false, error: "Cuerpo JSON vacio o invalido." }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const kv = env?.KYRNFORGE_KV || env?.KV || env?.DB || env?.kyrnforge_kv;

    if (kv) {
      if (Array.isArray(payload.availableApps)) {
        await kv.put("available_apps", JSON.stringify(payload.availableApps));
      }
      if (Array.isArray(payload.projects)) {
        await kv.put("projects", JSON.stringify(payload.projects));
      }
      if (payload.siteSettings) {
        await kv.put("site_settings", JSON.stringify(payload.siteSettings));
      }

      return new Response(JSON.stringify({
        success: true,
        source: "cloudflare-kv",
        message: "Todos los datos del sitio guardados en Cloudflare KV en la nube.",
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      source: "client-persisted",
      message: "Contenido recibido. Para persistencia permanente en la nube sin compilar, asocia una base de datos KV en Cloudflare Pages, o usa el guardado local con deploy.bat.",
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key"
    }
  });
}
