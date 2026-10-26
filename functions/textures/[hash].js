// GET /textures/:hash — PNG de un aspecto. El nombre es su SHA-256, así que nunca cambia.
import { getKv, keys } from "../api/v1/skins/skin-utils.js";

export async function onRequestGet({ env, params }) {
  const hash = String(params.hash || "").replace(/\.png$/, "");
  if (!/^[0-9a-f]{64}$/.test(hash)) return new Response("Not found", { status: 404 });
  const kv = getKv(env);
  const png = kv ? await kv.get(keys.png(hash), { type: "arrayBuffer" }) : null;
  if (!png) return new Response("Not found", { status: 404 });
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
