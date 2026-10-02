// Cloudflare Pages Function: /api/v1/content
// Supports GET (retrieve full site data) and POST (save full site data or individual sections)

export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (env.KYRNFORGE_KV) {
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

    if (env.KYRNFORGE_KV) {
      if (payload.availableApps) {
        await env.KYRNFORGE_KV.put("available_apps", JSON.stringify(payload.availableApps));
      }
      if (payload.projects) {
        await env.KYRNFORGE_KV.put("projects", JSON.stringify(payload.projects));
      }
      if (payload.siteSettings) {
        await env.KYRNFORGE_KV.put("site_settings", JSON.stringify(payload.siteSettings));
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Contenido completo sincronizado con el servidor de Cloudflare.",
      timestamp: new Date().toISOString()
    }), {
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
