// /api/v1/skins/admin — moderación desde /mod (clave de administrador).
//   GET   denuncias pendientes
//   POST  { action: "remove", name } borra el aspecto y libera el nombre
//         { action: "dismiss", name } descarta sus denuncias
import { isAdmin } from "../auth/admin-utils.js";
import { releaseName } from "./index.js";
import { fail, getKv, json, keys, preflight, publicSkin, readJson } from "./skin-utils.js";

export const onRequestOptions = preflight;

function authorized(request, env) {
  const key = (request.headers.get("x-admin-key") || request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  return isAdmin(key.trim(), env);
}

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return fail("No autorizado.", 401);
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const origin = new URL(request.url).origin;
  const reports = await readJson(kv, keys.reports, []);
  const byName = new Map();
  for (const r of reports) {
    const lower = r.name.toLowerCase();
    const entry = byName.get(lower) || { name: r.name, count: 0, reasons: [] };
    entry.count++;
    if (r.reason) entry.reasons.push(r.reason);
    byName.set(lower, entry);
  }
  const items = [];
  for (const [lower, entry] of byName) {
    const record = await readJson(kv, keys.name(lower));
    if (record) items.push({ ...entry, skin: publicSkin(record, origin) });
  }
  return json({ success: true, reports: items });
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return fail("No autorizado.", 401);
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const body = await request.json().catch(() => ({}));
  const lower = String(body.name || "").toLowerCase();
  if (!lower) return fail("Falta el nombre.");

  if (body.action === "remove") {
    const record = await readJson(kv, keys.name(lower));
    await releaseName(kv, lower);
    if (record?.owner) await kv.delete(keys.user(record.owner));
  } else if (body.action !== "dismiss") {
    return fail("Acción no válida.");
  }
  const reports = (await readJson(kv, keys.reports, [])).filter((r) => r.name.toLowerCase() !== lower);
  await kv.put(keys.reports, JSON.stringify(reports));
  return json({ success: true });
}
