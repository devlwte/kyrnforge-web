// GET /api/yggdrasil/sessionserver/session/minecraft/profile/:uuid[?unsigned=false]
// Perfil con su textura, igual que el de Mojang. El UUID es el sin conexión del nombre.
import {
  getKv, json, keys, mojangProfile, mojangSkin, readJson, texturesProperty,
} from "../../../../../v1/skins/skin-utils.js";

export async function onRequestGet({ request, env, params }) {
  const uuid = String(params.uuid || "").replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(uuid)) return new Response(null, { status: 204 });
  const kv = getKv(env);
  const ref = kv ? await kv.get(keys.uuid(uuid)) : null;
  if (!ref) return new Response(null, { status: 204 });
  const signed = new URL(request.url).searchParams.get("unsigned") === "false";

  let name, url, slim;
  if (ref.startsWith("premium:")) {
    const premium = await mojangProfile(ref.slice(8)).catch(() => null);
    const skin = premium ? await mojangSkin(premium.id) : null;
    if (!skin) return new Response(null, { status: 204 });
    ({ name } = premium);
    ({ url, slim } = skin);
  } else {
    const record = await readJson(kv, keys.name(ref));
    if (!record) return new Response(null, { status: 204 });
    name = record.name;
    url = `${new URL(request.url).origin}/textures/${record.hash}`;
    slim = record.model === "slim";
  }
  const property = await texturesProperty(env, { uuid, name, url, slim }, signed);
  return json({ id: uuid, name, properties: [property] }, 200, { "Cache-Control": "public, max-age=60" });
}
