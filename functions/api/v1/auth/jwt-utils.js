// Cloudflare Pages Function: /api/v1/auth/jwt-utils.js
// Utilidades criptográficas nativas usando Web Crypto API (sin dependencias npm)

const DEFAULT_SECRET = "kyrncloud_jwt_secret_key_2026_devforge";

export async function getJwtSecretKey(env) {
  const secretStr = env?.JWT_SECRET || env?.ADMIN_KEY || DEFAULT_SECRET;
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretStr),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Codificación Base64URL estándar
export function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Firmar un JWT con HMAC-SHA256
export async function signJwt(payload, env) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getJwtSecretKey(env);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign)
  );

  const sigBytes = new Uint8Array(signatureBuffer);
  let sigBinary = "";
  for (let i = 0; i < sigBytes.byteLength; i++) {
    sigBinary += String.fromCharCode(sigBytes[i]);
  }
  const encodedSignature = btoa(sigBinary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${dataToSign}.${encodedSignature}`;
}

// Verificar un JWT y devolver el payload si es válido
export async function verifyJwt(token, env) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const dataToVerify = `${encodedHeader}.${encodedPayload}`;

  const key = await getJwtSecretKey(env);
  let base64Sig = signature.replace(/-/g, "+").replace(/_/g, "/");
  while (base64Sig.length % 4) {
    base64Sig += "=";
  }
  const binarySig = atob(base64Sig);
  const sigBytes = new Uint8Array(binarySig.length);
  for (let i = 0; i < binarySig.length; i++) {
    sigBytes[i] = binarySig.charCodeAt(i);
  }

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(dataToVerify)
  );

  if (!isValid) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    // Validar expiración
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expirado
    }
    return payload;
  } catch {
    return null;
  }
}

// Hash de contraseña usando PBKDF2 con SHA-256 y sal aleatoria
export async function hashPassword(password, saltHex = null) {
  const encoder = new TextEncoder();
  let saltBytes;

  if (saltHex) {
    saltBytes = new Uint8Array(
      saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
  } else {
    saltBytes = new Uint8Array(16);
    crypto.getRandomValues(saltBytes);
    saltHex = Array.from(saltBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { hash: hashHex, salt: saltHex };
}

export function getKv(env) {
  return env?.KYRNFORGE_KV || env?.KV || env?.DB || env?.kyrnforge_kv || null;
}
