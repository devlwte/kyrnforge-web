// GET /api/v1/skins/me — aspecto publicado por la cuenta con sesión.
import { currentUser, fail, getKv, json, keys, preflight, publicSkin, readJson } from "./skin-utils.js";

export const onRequestOptions = preflight;

export async function onRequestGet({ request, env }) {
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const user = await currentUser(request, env);
  if (!user) return fail("Inicia sesión.", 401);
  const lower = await kv.get(keys.user(user.sub));
  const record = lower ? await readJson(kv, keys.name(lower)) : null;
  return json({
    success: true,
    user: { name: user.name, email: user.email },
    skin: record ? publicSkin(record, new URL(request.url).origin) : null,
  });
}
