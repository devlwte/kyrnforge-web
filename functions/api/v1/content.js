// Cloudflare Pages Function: /api/v1/content
// Supports GET (retrieve full site data) and POST (save full site data or individual sections)

export async function onRequestGet(context) {
  try {
    const { env, request } = context;

    // 1. If Cloudflare KV is configured
    if (env && env.KYRNFORGE_KV) {
      const apps = await env.KYRNFORGE_KV.get("available_apps", { type: "json" });
      const projects = await env.KYRNFORGE_KV.get("projects", { type: "json" });
      const siteSettings = await env.KYRNFORGE_KV.get("site_settings", { type: "json" });

      if (apps || projects || siteSettings) {
        return new Response(JSON.stringify({
          source: "cloudflare-kv",
          availableApps: apps || null,
          projects: projects || null,
          siteSettings: siteSettings || null
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=30"
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
        availableApps: resApps,
        projects: resProjects,
        siteSettings: resSettings
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60"
        }
      });
    }

    return new Response(JSON.stringify({
      source: "edge-defaults",
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

    if (env && env.KYRNFORGE_KV) {
      if (Array.isArray(payload.availableApps)) {
        await env.KYRNFORGE_KV.put("available_apps", JSON.stringify(payload.availableApps));
      }
      if (Array.isArray(payload.projects)) {
        await env.KYRNFORGE_KV.put("projects", JSON.stringify(payload.projects));
      }
      if (payload.siteSettings) {
        await env.KYRNFORGE_KV.put("site_settings", JSON.stringify(payload.siteSettings));
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
