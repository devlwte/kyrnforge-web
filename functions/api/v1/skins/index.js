// /api/v1/skins
//   GET              galería de aspectos recientes
//   POST   (sesión)  subir o reemplazar el aspecto de un nombre: { name, model, png }
//   DELETE (sesión)  borrar el aspecto propio y liberar el nombre
import {
  MAX_PNG_BYTES, NAME_RE, RECENT_LIMIT, base64ToBytes, currentUser, fail, getKv, inspectPng, json, keys,
  mojangProfile, offlineUuid, preflight, publicSkin, readJson, sha256Hex,
} from "./skin-utils.js";

export const onRequestOptions = preflight;

export async function onRequestGet({ request, env }) {
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const origin = new URL(request.url).origin;
  const recent = await readJson(kv, keys.recent, []);
  return json({ success: true, skins: recent.map((r) => publicSkin(r, origin)) }, 200, {
    "Cache-Control": "public, max-age=30",
  });
}

export async function onRequestPost({ request, env }) {
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const user = await currentUser(request, env);
  if (!user) return fail("Inicia sesión para subir tu aspecto.", 401);

  if (await kv.get(keys.rate(user.sub))) return fail("Espera un minuto antes de volver a subir.", 429);

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const model = body.model === "slim" ? "slim" : "classic";
  if (!NAME_RE.test(name)) return fail("El nombre debe tener de 3 a 16 caracteres: letras, números o _.");

  let png;
  try {
    png = base64ToBytes(String(body.png || ""));
  } catch {
    return fail("La imagen no es válida.");
  }
  if (png.length > MAX_PNG_BYTES) return fail("La imagen pesa demasiado (máximo 24 KB).");
  const check = inspectPng(png);
  if (!check.ok) return fail(check.error);

  const lower = name.toLowerCase();
  const existing = await readJson(kv, keys.name(lower));
  if (existing && existing.owner !== user.sub) return fail("Ese nombre ya tiene dueño en KyrnForge Skins.", 409);

  if (!existing) {
    let premium;
    try {
      premium = await mojangProfile(name);
    } catch {
      return fail("No se pudo comprobar el nombre con Mojang. Inténtalo de nuevo.", 503);
    }
    if (premium) {
      return fail(`«${premium.name}» es un nombre premium: su aspecto llega automáticamente desde su cuenta de Mojang.`, 409);
    }
  }

  // Un nombre por cuenta: si la cuenta tenía otro, se libera.
  const previous = await kv.get(keys.user(user.sub));
  if (previous && previous !== lower) await releaseName(kv, previous);

  const hash = await sha256Hex(png);
  const now = new Date().toISOString();
  const uuid = offlineUuid(name);
  const record = {
    name, model, hash, uuid, owner: user.sub,
    createdAt: existing?.createdAt || now, updatedAt: now,
  };
  await kv.put(keys.png(hash), png);
  await kv.put(keys.name(lower), JSON.stringify(record));
  await kv.put(keys.uuid(uuid), lower);
  await kv.put(keys.user(user.sub), lower);
  await kv.put(keys.rate(user.sub), "1", { expirationTtl: 60 });

  const recent = (await readJson(kv, keys.recent, [])).filter((r) => r.name.toLowerCase() !== lower);
  recent.unshift(record);
  await kv.put(keys.recent, JSON.stringify(recent.slice(0, RECENT_LIMIT)));

  return json({ success: true, skin: publicSkin(record, new URL(request.url).origin) }, 201);
}

export async function onRequestDelete({ request, env }) {
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const user = await currentUser(request, env);
  if (!user) return fail("Inicia sesión.", 401);
  const lower = await kv.get(keys.user(user.sub));
  if (!lower) return fail("No tienes ningún aspecto publicado.", 404);
  await releaseName(kv, lower);
  await kv.delete(keys.user(user.sub));
  return json({ success: true });
}

export async function releaseName(kv, lower) {
  const record = await readJson(kv, keys.name(lower));
  if (record) await kv.delete(keys.uuid(record.uuid));
  await kv.delete(keys.name(lower));
  const recent = (await readJson(kv, keys.recent, [])).filter((r) => r.name.toLowerCase() !== lower);
  await kv.put(keys.recent, JSON.stringify(recent));
}
