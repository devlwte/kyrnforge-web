// POST /api/v1/skins/report — denunciar un aspecto: { name, reason }.
import { NAME_RE, REPORTS_LIMIT, fail, getKv, json, keys, preflight, readJson } from "./skin-utils.js";

export const onRequestOptions = preflight;

export async function onRequestPost({ request, env }) {
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const reason = String(body.reason || "").trim().slice(0, 200);
  if (!NAME_RE.test(name)) return fail("Nombre no válido.");
  if (!(await kv.get(keys.name(name.toLowerCase())))) return fail("Ese aspecto no existe.", 404);

  const reports = await readJson(kv, keys.reports, []);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const duplicate = reports.some((r) => r.name.toLowerCase() === name.toLowerCase() && r.ip === ip);
  if (!duplicate) {
    reports.unshift({ name, reason, ip, at: new Date().toISOString() });
    await kv.put(keys.reports, JSON.stringify(reports.slice(0, REPORTS_LIMIT)));
  }
  return json({ success: true });
}
