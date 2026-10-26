// GET /api/yggdrasil — metadatos para authlib-injector (raíz de la API de KyrnForge Skins).
import { json, publicKeyPem } from "../v1/skins/skin-utils.js";

export async function onRequestGet({ request, env }) {
  const host = new URL(request.url).hostname;
  return json({
    meta: {
      serverName: "KyrnForge Skins",
      implementationName: "kyrnforge-skins",
      implementationVersion: "1.0.0",
      links: { homepage: "https://kyrnforge.dev/skins", register: "https://kyrnforge.dev/skins" },
      "feature.non_email_login": true,
    },
    skinDomains: [...new Set(["kyrnforge.dev", ".kyrnforge.dev", ".kyrnforge.pages.dev", "textures.minecraft.net", host])],
    signaturePublickey: await publicKeyPem(env),
  }, 200, { "Cache-Control": "public, max-age=3600" });
}
