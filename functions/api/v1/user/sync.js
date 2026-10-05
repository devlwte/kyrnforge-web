// Cloudflare Pages Function: /api/v1/user/sync
// Sincronización multi-tenant aislada por user_id
import { verifyJwt, getKv } from "../auth/jwt-utils.js";

// Memoria volátil de respaldo para previsualización local si KV no está enlazado
const localMockSync = new Map();

// Helper para extraer y verificar JWT
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const token = match[1].trim();
  return await verifyJwt(token, env);
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const userPayload = await authenticateRequest(request, env);

    if (!userPayload) {
      return errorResponse("No autorizado. Token inválido o expirado.", 401);
    }

    const userId = userPayload.sub;
    const kv = getKv(env);
    const syncKey = `user:${userId}:sync`;

    let syncData = null;
    if (kv) {
      const raw = await kv.get(syncKey);
      if (raw) syncData = JSON.parse(raw);
    } else {
      syncData = localMockSync.get(syncKey);
    }

    if (!syncData) {
      syncData = {
        workspaces: [],
        favoritePorts: [3000, 5173, 8080],
        settings: {
          autoRefreshInterval: 2000,
          hideSystemPorts: true,
          strictZombieMode: false
        },
        updatedAt: null
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: userPayload.email,
          name: userPayload.name,
          tier: userPayload.tier || "free"
        },
        data: syncData,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: corsHeaders()
      }
    );
  } catch (err) {
    return errorResponse(`Error al recuperar datos: ${err.message}`, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const userPayload = await authenticateRequest(request, env);

    if (!userPayload) {
      return errorResponse("No autorizado. Token inválido o expirado.", 401);
    }

    const userId = userPayload.sub;
    const body = await request.json().catch(() => ({}));

    // Sanitización y aislamiento estricto de campos permitidos
    // Garantía de privacidad: Solo se sincronizan nombres, puertos y preferencias
    const workspaces = Array.isArray(body.workspaces) ? body.workspaces.map(w => ({
      id: w.id || `ws_${Date.now()}`,
      name: String(w.name || "Workspace").slice(0, 50),
      ports: Array.isArray(w.ports) ? w.ports.map(Number).filter(p => !isNaN(p) && p > 0 && p <= 65535) : [],
      description: String(w.description || "").slice(0, 150)
    })) : [];

    const favoritePorts = Array.isArray(body.favoritePorts)
      ? body.favoritePorts.map(Number).filter(p => !isNaN(p) && p > 0 && p <= 65535)
      : [];

    const settings = typeof body.settings === "object" && body.settings !== null ? {
      autoRefreshInterval: Number(body.settings.autoRefreshInterval) || 2000,
      hideSystemPorts: Boolean(body.settings.hideSystemPorts),
      strictZombieMode: Boolean(body.settings.strictZombieMode)
    } : {};

    const now = new Date().toISOString();
    const syncPayload = {
      workspaces,
      favoritePorts,
      settings,
      updatedAt: now
    };

    const kv = getKv(env);
    const syncKey = `user:${userId}:sync`;

    if (kv) {
      await kv.put(syncKey, JSON.stringify(syncPayload));
    } else {
      localMockSync.set(syncKey, syncPayload);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Configuración sincronizada exitosamente en Kyrn Cloud.",
        updatedAt: now,
        itemsCount: {
          workspaces: workspaces.length,
          favoritePorts: favoritePorts.length
        }
      }),
      {
        status: 200,
        headers: corsHeaders()
      }
    );
  } catch (err) {
    return errorResponse(`Error al sincronizar: ${err.message}`, 500);
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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
