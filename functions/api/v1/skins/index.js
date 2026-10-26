// /api/v1/skins
//   GET                     galería de aspectos recientes
//   POST   (sesión)         publicar un nombre nuevo o cambiar uno propio: { name, model, png }
//   DELETE (sesión) ?name=  borrar uno de tus aspectos y liberar su nombre
import {
  MAX_PNG_BYTES, MAX_SKINS_PER_USER, NAME_RE, RECENT_LIMIT, UPLOADS_PER_MINUTE, base64ToBytes, currentUser, fail,
  getKv, inspectPng, json, keys, mojangProfile, offlineUuid, preflight, publicSkin, readJson, sha256Hex, userNames,
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
  if (!user) return fail("Inicia sesión para subir aspectos.", 401);

  const uploads = Number(await kv.get(keys.rate(user.sub))) || 0;
  if (uploads >= UPLOADS_PER_MINUTE) return fail("Demasiadas subidas seguidas. Espera un minuto.", 429);

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

  const mine = await userNames(kv, user.sub);
  if (!existing) {
    if (mine.length >= MAX_SKINS_PER_USER) {
      return fail(`Puedes tener hasta ${MAX_SKINS_PER_USER} aspectos. Borra uno para publicar otro.`, 409);
    }
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

  const hash = await sha256Hex(png);
  const now = new Date().toISOString();
  const uuid = offlineUuid(name);
  const record = {
    name: existing?.name || name, model, hash, uuid, owner: user.sub,
    createdAt: existing?.createdAt || now, updatedAt: now,
  };
  await kv.put(keys.png(hash), png);
  await kv.put(keys.name(lower), JSON.stringify(record));
  await kv.put(keys.uuid(uuid), lower);
  if (!mine.includes(lower)) await kv.put(keys.user(user.sub), JSON.stringify([...mine, lower]));
  await kv.put(keys.rate(user.sub), String(uploads + 1), { expirationTtl: 60 });

  const recent = (await readJson(kv, keys.recent, [])).filter((r) => r.name.toLowerCase() !== lower);
  recent.unshift(record);
  await kv.put(keys.recent, JSON.stringify(recent.slice(0, RECENT_LIMIT)));

  return json({ success: true, created: !existing, skin: publicSkin(record, new URL(request.url).origin) }, existing ? 200 : 201);
}

export async function onRequestDelete({ request, env }) {
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const user = await currentUser(request, env);
  if (!user) return fail("Inicia sesión.", 401);
  const lower = (new URL(request.url).searchParams.get("name") || "").toLowerCase();
  const mine = await userNames(kv, user.sub);
  if (!lower || !mine.includes(lower)) return fail("Ese aspecto no es tuyo.", 404);
  await releaseName(kv, lower);
  await kv.put(keys.user(user.sub), JSON.stringify(mine.filter((n) => n !== lower)));
  return json({ success: true });
}

export async function releaseName(kv, lower) {
  const record = await readJson(kv, keys.name(lower));
  if (record) await kv.delete(keys.uuid(record.uuid));
  await kv.delete(keys.name(lower));
  const recent = (await readJson(kv, keys.recent, [])).filter((r) => r.name.toLowerCase() !== lower);
  await kv.put(keys.recent, JSON.stringify(recent));
}
