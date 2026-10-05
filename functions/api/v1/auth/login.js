// Cloudflare Pages Function: POST /api/v1/auth/login
import { hashPassword, signJwt, getKv } from "./jwt-utils.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!email || !password) {
      return errorResponse("Por favor proporciona correo y contraseña.", 400);
    }

    const kv = getKv(env);
    let userId = null;

    if (kv) {
      userId = await kv.get(`user:email:${email}`);
    }

    // Si no se encuentra en KV ni existe userId
    if (!userId) {
      return errorResponse("Credenciales incorrectas o cuenta inexistente.", 401);
    }

    // Obtener perfil del usuario
    const profileJson = await kv.get(`user:${userId}:profile`);
    if (!profileJson) {
      return errorResponse("Error al cargar el perfil de usuario.", 500);
    }

    const user = JSON.parse(profileJson);

    // Hashear la contraseña recibida con la sal guardada del usuario
    const { hash } = await hashPassword(password, user.salt);

    // Comparar hash
    if (hash !== user.hash) {
      return errorResponse("Credenciales incorrectas o cuenta inexistente.", 401);
    }

    // Generar nuevo Token JWT válido por 30 días
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier || "free",
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
    };
    const token = await signJwt(tokenPayload, env);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sesión iniciada correctamente.",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier || "free",
          createdAt: user.createdAt
        }
      }),
      {
        status: 200,
        headers: corsHeaders()
      }
    );
  } catch (err) {
    return errorResponse(`Error al autenticar: ${err.message}`, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

function corsHeaders() {
  return {
    "Content-Type": "application/json; charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store, no-cache, must-revalidate"
  };
}

function errorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: corsHeaders()
    }
  );
}
