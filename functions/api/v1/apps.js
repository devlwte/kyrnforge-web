// Cloudflare Pages Function: /api/v1/apps
// Supports GET (retrieve apps JSON) and POST (save/update apps)

export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    // 1. Check if Cloudflare KV is configured
    if (env && env.KYRNFORGE_KV) {
      const stored = await env.KYRNFORGE_KV.get("available_apps", { type: "json" });
      if (stored) {
        return new Response(JSON.stringify(stored), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=60"
          }
        });
      }
    }

    // 2. Fallback to the real public/data/apps.json file
    if (env && env.ASSETS) {
      const jsonUrl = new URL('/data/apps.json', request.url);
      const staticRes = await env.ASSETS.fetch(jsonUrl);
      if (staticRes && staticRes.ok) {
        return new Response(staticRes.body, {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=60"
          }
        });
      }
    }

    return new Response(JSON.stringify({
      message: "Apps JSON endpoint activo.",
      source: "edge-static"
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
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

    // Verify admin credential
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
      return new Response(JSON.stringify({ success: false, error: "Cuerpo JSON invalido." }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const apps = Array.isArray(payload) ? payload : payload.apps;
    if (!Array.isArray(apps)) {
      return new Response(JSON.stringify({ success: false, error: "Se esperaba un array de apps." }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // If Cloudflare KV is bound, persist to KV
    if (env && env.KYRNFORGE_KV) {
      await env.KYRNFORGE_KV.put("available_apps", JSON.stringify(apps));
      return new Response(JSON.stringify({
        success: true,
        source: "cloudflare-kv",
        message: "Aplicaciones guardadas permanentemente en Cloudflare KV en la nube.",
        count: apps.length,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      source: "client-persisted",
      message: "Datos recibidos correctamente. Para persistencia permanente en la nube sin compilar, asocia una base de datos KV en Cloudflare Pages, o usa el guardado local con deploy.bat.",
      count: apps.length,
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
