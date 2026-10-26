// Verificación de la clave de administrador del panel /mod.
// Sin secreto configurado en Cloudflare no se acepta ninguna clave.

export function adminSecret(env) {
  return env?.ADMIN_KEY || env?.MOD_PASSWORD || env?.ADMIN_PASSWORD || null;
}

export function isAdmin(provided, env) {
  const expected = adminSecret(env);
  if (!expected || !provided) return false;
  return timingSafeEqual(provided, expected);
}

export function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(String(a));
  const y = enc.encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}
