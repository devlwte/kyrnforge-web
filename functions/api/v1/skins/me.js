// GET /api/v1/skins/me — aspectos publicados por la cuenta con sesión.
import {
  MAX_SKINS_PER_USER, currentUser, fail, getKv, json, keys, preflight, publicSkin, readJson, userNames,
} from "./skin-utils.js";

export const onRequestOptions = preflight;

export async function onRequestGet({ request, env }) {
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const user = await currentUser(request, env);
  if (!user) return fail("Inicia sesión.", 401);
  const origin = new URL(request.url).origin;
  const skins = [];
  for (const lower of await userNames(kv, user.sub)) {
    const record = await readJson(kv, keys.name(lower));
    if (record) skins.push(publicSkin(record, origin));
  }
  skins.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return json({ success: true, user: { name: user.name, email: user.email }, skins, limit: MAX_SKINS_PER_USER });
}
