// POST /api/yggdrasil/api/profiles/minecraft — nombres → perfiles (UUID sin conexión).
import { NAME_RE, getKv, json, keys, offlineUuid } from "../../../v1/skins/skin-utils.js";

export async function onRequestPost({ request, env }) {
  const names = await request.json().catch(() => []);
  if (!Array.isArray(names)) return json([]);
  const kv = getKv(env);
  const out = [];
  for (const raw of names.slice(0, 10)) {
    const name = String(raw);
    if (!NAME_RE.test(name) || !kv) continue;
    const uuid = offlineUuid(name);
    if (await kv.get(keys.uuid(uuid))) out.push({ id: uuid, name });
  }
  return json(out);
}
