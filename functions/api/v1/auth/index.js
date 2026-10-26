// Cloudflare Pages Function: /api/v1/auth
// Validates admin password against Cloudflare Environment Secrets (ADMIN_PASSWORD / ADMIN_KEY)
import { isAdmin } from "./admin-utils.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const provided = (body.password || "").trim();
    if (isAdmin(provided, env)) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Autenticado correctamente." 
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: "Contraseña incorrecta." 
    }), {
      status: 401,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
