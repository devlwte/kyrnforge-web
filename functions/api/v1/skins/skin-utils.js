// Utilidades de KyrnForge Skins: validación, UUID sin conexión, firmas y acceso a KV.
import { verifyJwt, getKv } from "../auth/jwt-utils.js";

export { getKv };

export const NAME_RE = /^[A-Za-z0-9_]{3,16}$/;
export const MAX_PNG_BYTES = 24 * 1024;
export const RECENT_LIMIT = 120;
export const MAX_SKINS_PER_USER = 10;
export const UPLOADS_PER_MINUTE = 6;
export const REPORTS_LIMIT = 500;

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "no-store",
      ...extra,
    },
  });
}

export function fail(message, status = 400) {
  return json({ success: false, error: message }, status);
}

export function preflight() {
  return json(null, 204);
}

export async function currentUser(request, env) {
  const match = (request.headers.get("Authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  try {
    return await verifyJwt(match[1].trim(), env);
  } catch {
    return null;
  }
}

// ---------- Datos en KV ----------

export const keys = {
  name: (lower) => `skin:name:${lower}`,
  user: (userId) => `skin:user:${userId}`,
  uuid: (uuid) => `skin:uuid:${uuid}`,
  png: (hash) => `skin:png:${hash}`,
  rate: (userId) => `skin:rate:${userId}`,
  recent: "skin:recent",
  reports: "skin:reports",
};

export async function readJson(kv, key, fallback = null) {
  const value = await kv.get(key, { type: "json" });
  return value ?? fallback;
}

/// Nombres (en minúsculas) de los aspectos de una cuenta. Antes se guardaba uno solo como texto.
export async function userNames(kv, userId) {
  const raw = await kv.get(keys.user(userId));
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [String(list)];
  } catch {
    return [raw];
  }
}

export function publicSkin(record, origin) {
  return {
    name: record.name,
    uuid: hyphenate(record.uuid),
    model: record.model,
    url: `${origin}/textures/${record.hash}`,
    updatedAt: record.updatedAt,
  };
}

// ---------- PNG ----------

/// Comprueba que sea un PNG de aspecto (64x64 o el formato antiguo 64x32).
export function inspectPng(bytes) {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 33 || sig.some((b, i) => bytes[i] !== b)) return { ok: false, error: "El archivo no es un PNG." };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (width !== 64 || (height !== 64 && height !== 32)) {
    return { ok: false, error: `El aspecto debe medir 64x64 (o 64x32); este mide ${width}x${height}.` };
  }
  return { ok: true, width, height };
}

export async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function base64ToBytes(b64) {
  const clean = b64.replace(/^data:image\/png;base64,/, "");
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// ---------- UUID sin conexión ----------

/// UUID que un servidor sin conexión da a un nombre: MD5("OfflinePlayer:" + nombre) con versión 3.
export function offlineUuid(name) {
  const bytes = md5(new TextEncoder().encode(`OfflinePlayer:${name}`));
  bytes[6] = (bytes[6] & 0x0f) | 0x30;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hyphenate(uuid) {
  const u = uuid.replace(/-/g, "");
  return `${u.slice(0, 8)}-${u.slice(8, 12)}-${u.slice(12, 16)}-${u.slice(16, 20)}-${u.slice(20)}`;
}

// MD5 (RFC 1321). Web Crypto no lo incluye y solo se usa para el UUID sin conexión.
function md5(input) {
  const s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
    6, 10, 15, 21];
  const k = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);
  const len = input.length;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(input);
  padded[len] = 0x80;
  const bits = len * 8;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, bits >>> 0, true);
  dv.setUint32(padded.length - 4, Math.floor(bits / 2 ** 32), true);
  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  for (let off = 0; off < padded.length; off += 64) {
    const m = Array.from({ length: 16 }, (_, i) => dv.getUint32(off + i * 4, true));
    let [a, b, c, d] = [a0, b0, c0, d0];
    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; }
      const tmp = d;
      d = c;
      c = b;
      const sum = (a + f + k[i] + m[g]) >>> 0;
      b = (b + ((sum << s[i]) | (sum >>> (32 - s[i])))) >>> 0;
      a = tmp;
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }
  const out = new Uint8Array(16);
  const ov = new DataView(out.buffer);
  [a0, b0, c0, d0].forEach((w, i) => ov.setUint32(i * 4, w, true));
  return out;
}

// ---------- Nombres premium (Mojang) ----------

/// Perfil premium de un nombre o null. Se guarda 6 h en la caché del borde.
export async function mojangProfile(name) {
  // La API antigua a veces rechaza las IP de Cloudflare; la de minecraftservices sirve de respaldo.
  const urls = [
    `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(name)}`,
    `https://api.minecraftservices.com/minecraft/profile/lookup/name/${encodeURIComponent(name)}`,
  ];
  const statuses = [];
  for (const url of urls) {
    const res = await fetch(url, {
      headers: { "User-Agent": "KyrnForge-Skins/1.0 (+https://kyrnforge.dev/skins)", Accept: "application/json" },
      cf: { cacheTtl: 21600, cacheEverything: true },
    });
    if (res.status === 204 || res.status === 404) return null;
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.id) return { id: data.id, name: data.name };
      if (data && !data.id) return null;
    }
    statuses.push(res.status);
  }
  const mirror = await playerDb(name);
  if (mirror !== undefined) return mirror && { id: mirror.id, name: mirror.name };
  throw new Error(`Mojang respondió ${statuses.join(", ")}`);
}

/// Espejo público de los perfiles de Mojang (Mojang rechaza las IP de Cloudflare).
/// Devuelve el perfil, null si el jugador no existe o undefined si el espejo falla.
async function playerDb(nameOrId) {
  try {
    const res = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(nameOrId)}`, {
      headers: { "User-Agent": "KyrnForge-Skins/1.0 (+https://kyrnforge.dev/skins)" },
      cf: { cacheTtl: 21600, cacheEverything: true },
    });
    const data = await res.json().catch(() => null);
    if (data?.success && data.data?.player) {
      const p = data.data.player;
      const prop = (p.properties || []).find((x) => x.name === "textures");
      return { id: p.raw_id || p.id.replace(/-/g, ""), name: p.username, textures: prop?.value || null };
    }
    if (data && /not_found|invalid/.test(String(data.code))) return null;
  } catch {
    // El espejo no respondió.
  }
  return undefined;
}

/// Textura del aspecto premium: { url, slim } o null.
export async function mojangSkin(premiumId) {
  let encoded = null;
  const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${premiumId}`, {
    cf: { cacheTtl: 21600, cacheEverything: true },
  });
  if (res.ok) {
    const data = await res.json().catch(() => ({}));
    encoded = (data.properties || []).find((p) => p.name === "textures")?.value || null;
  } else {
    encoded = (await playerDb(premiumId))?.textures || null;
  }
  if (!encoded) return null;
  const textures = JSON.parse(atob(encoded)).textures || {};
  if (!textures.SKIN?.url) return null;
  return { url: textures.SKIN.url.replace(/^http:/, "https:"), slim: textures.SKIN.metadata?.model === "slim" };
}

// ---------- Firma de texturas (compatible con authlib-injector) ----------

let keyCache = null;

async function signingKeys(env) {
  const pem = env?.SKIN_SIGNING_KEY;
  if (!pem) throw new Error("SKIN_SIGNING_KEY no está configurado");
  if (keyCache?.pem === pem) return keyCache;
  const der = base64ToBytes(pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""));
  const params = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-1" };
  const privateKey = await crypto.subtle.importKey("pkcs8", der, params, true, ["sign"]);
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);
  const publicKey = await crypto.subtle.importKey("jwk", { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS1", ext: true },
    params, true, ["verify"]);
  const spki = new Uint8Array(await crypto.subtle.exportKey("spki", publicKey));
  const b64 = bytesToBase64(spki).match(/.{1,64}/g).join("\n");
  keyCache = { pem, privateKey, publicPem: `-----BEGIN PUBLIC KEY-----\n${b64}\n-----END PUBLIC KEY-----\n` };
  return keyCache;
}

export async function publicKeyPem(env) {
  return (await signingKeys(env)).publicPem;
}

/// Propiedad `textures` firmada como la entrega Mojang.
export async function texturesProperty(env, { uuid, name, url, slim }, signed) {
  const payload = {
    timestamp: Date.now(),
    profileId: uuid,
    profileName: name,
    textures: { SKIN: slim ? { url, metadata: { model: "slim" } } : { url } },
  };
  const value = btoa(JSON.stringify(payload));
  if (!signed) return { name: "textures", value };
  const { privateKey } = await signingKeys(env);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(value));
  return { name: "textures", value, signature: bytesToBase64(new Uint8Array(sig)) };
}
