// GET /api/v1/skins/name/:name — aspecto de un nombre para xLaunch y la galería.
// Un nombre premium devuelve su aspecto de Mojang; además se recuerda su UUID sin conexión para
// que el perfil por UUID (lo que pide el juego) también lo encuentre.
import {
  NAME_RE, fail, getKv, hyphenate, json, keys, mojangProfile, mojangSkin, offlineUuid, preflight, publicSkin,
  readJson,
} from "../skin-utils.js";

export const onRequestOptions = preflight;

export async function onRequestGet({ request, env, params }) {
  const kv = getKv(env);
  if (!kv) return fail("Almacenamiento no disponible.", 503);
  const name = String(params.name || "");
  if (!NAME_RE.test(name)) return fail("Nombre no válido.");
  const lower = name.toLowerCase();

  const record = await readJson(kv, keys.name(lower));
  if (record) {
    return json({ success: true, source: "kyrnforge", skin: publicSkin(record, new URL(request.url).origin) }, 200, {
      "Cache-Control": "public, max-age=60",
    });
  }

  let premium = null;
  try {
    premium = await mojangProfile(name);
  } catch (err) {
    return fail(`No se pudo consultar a Mojang (${err.message}).`, 503);
  }
  if (!premium) return json({ success: true, source: null, skin: null }, 200, { "Cache-Control": "public, max-age=60" });

  const uuid = offlineUuid(premium.name);
  if (!(await kv.get(keys.uuid(uuid)))) await kv.put(keys.uuid(uuid), `premium:${premium.name}`);
  const skin = await mojangSkin(premium.id);
  return json({
    success: true,
    source: "mojang",
    skin: skin ? { name: premium.name, uuid: hyphenate(uuid), model: skin.slim ? "slim" : "classic", url: skin.url } : null,
  }, 200, { "Cache-Control": "public, max-age=300" });
}
