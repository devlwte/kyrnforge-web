// Cloudflare Pages Function: POST /api/v1/auth/register
import { hashPassword, signJwt, getKv } from "./jwt-utils.js";

// Memoria volátil de respaldo para previsualización local si KV no está enlazado
const localMockUsers = new Map();

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    // Validaciones
    if (!name || name.length < 2) {
      return errorResponse("Por favor ingresa un nombre válido.", 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return errorResponse("Correo electrónico inválido.", 400);
    }
    if (!password || password.length < 6) {
      return errorResponse("La contraseña debe tener al menos 6 caracteres.", 400);
    }

    const kv = getKv(env);
    const emailKey = `user:email:${email}`;

    // Verificar si el usuario ya existe
    let existingUserId = null;
    if (kv) {
      existingUserId = await kv.get(emailKey);
    } else {
      existingUserId = localMockUsers.get(emailKey);
    }

    if (existingUserId) {
      return errorResponse("Ya existe una cuenta con este correo electrónico.", 409);
    }

    // Hashear contraseña de forma segura con PBKDF2 + sal aleatoria
    const { hash, salt } = await hashPassword(password);
    const userId = `usr_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const userProfile = {
      id: userId,
      email,
      name,
      hash,
      salt,
      tier: "free",
      createdAt: now
    };

    const initialSyncData = {
      workspaces: [],
      favoritePorts: [3000, 5173, 8080],
      settings: {
        autoRefreshInterval: 2000,
        hideSystemPorts: true,
        strictZombieMode: false
      },
      updatedAt: now
    };

    // Almacenar en base de datos Cloudflare KV
    if (kv) {
      await kv.put(emailKey, userId);
      await kv.put(`user:${userId}:profile`, JSON.stringify(userProfile));
      await kv.put(`user:${userId}:sync`, JSON.stringify(initialSyncData));
    } else {
      localMockUsers.set(emailKey, userId);
      localMockUsers.set(`user:${userId}:profile`, JSON.stringify(userProfile));
      localMockUsers.set(`user:${userId}:sync`, JSON.stringify(initialSyncData));
    }

    // Firmar Token JWT (válido por 30 días)
    const tokenPayload = {
      sub: userId,
      email,
      name,
      tier: "free",
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
    };
    const token = await signJwt(tokenPayload, env);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cuenta creada exitosamente en Kyrn Cloud.",
        token,
        user: {
          id: userId,
          email,
          name,
          tier: "free",
          createdAt: now
        }
      }),
      {
        status: 201,
        headers: corsHeaders()
      }
    );
  } catch (err) {
    return errorResponse(`Error en el servidor: ${err.message}`, 500);
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
