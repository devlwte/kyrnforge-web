// Cloudflare Pages Function: /api/v1/shorten
// Public URL Shortener with Extreme Security Filtering and Quota Protection

// 1. ADULT / NSFW / MALWARE BLACKLISTS & REGEX
const FORBIDDEN_TLDS = [
  '.xxx', '.porn', '.adult', '.sex', '.sexy', '.cam', '.tube', '.dating', 
  '.fetish', '.webcam', '.erotica', '.nude', '.sucks'
];

const FORBIDDEN_DOMAINS = [
  'pornhub', 'xvideos', 'xnxx', 'redtube', 'youporn', 'chaturbate', 'onlyfans',
  'camsoda', 'stripchat', 'bongacams', 'spankbang', 'livejasmin', 'tube8', 'beeg',
  'eporner', 'heavy-r', 'motherless', 'tnaflix', 'brazzers', 'bangbros', 'naughtyamerica',
  'hentai', 'rule34', 'gelbooru', 'danbooru', 'e-hentai', 'fakku', 'luscious',
  'xhamster', 'daftsex', 'hqporner', 'porntrex', 'nuvid', 'thumbzilla', 'porndig',
  'fansly', 'manyvids', 'loyalfans', 'clips4sale', 'fapello', 'coomer', 'kemono'
];

const FORBIDDEN_KEYWORDS = [
  'porn', 'xxx', 'sexx', 'nude', 'hentai', 'erotic', 'escort', 'webcam', 'nsfw',
  'fetish', 'bdsm', 'incest', 'taboo', 'pedofil', 'zoofil', 'gore', 'snuff',
  'free-robux', 'steam-gift', 'nitro-gift', 'claim-airdrop', 'crypto-drainer'
];

// Block nested shady shorteners to prevent cloaking malware
const BLOCKED_SHORTENERS = [
  'adfly', 'adf.ly', 'linkvertise', 'shorte.st', 'ouo.io', 'bc.vc', 'shrinkearn',
  'exe.io', 'megaurl', 'shortzon', 'cuty.io', 'shrk.pro', 'za.gl'
];

function validateSafeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (_) {
    return { ok: false, error: 'La URL proporcionada no es válida. Debe incluir https:// o http://.' };
  }

  // 1. Protocol check
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Protocolo no permitido. Solo se admiten enlaces HTTP o HTTPS seguros.' };
  }

  const hostname = parsed.hostname.toLowerCase();
  const fullPath = (parsed.pathname + parsed.search + parsed.hash).toLowerCase();

  // 2. Private networks & SSRF block
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.16.') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.onion')
  ) {
    return { ok: false, error: 'No se permite acortar enlaces a redes locales o direcciones privadas.' };
  }

  // 3. TLD Blacklist
  for (const tld of FORBIDDEN_TLDS) {
    if (hostname.endsWith(tld)) {
      return { ok: false, error: 'Enlace bloqueado: Dominio clasificado como contenido para adultos o no seguro.' };
    }
  }

  // 4. Domain Blacklist
  for (const domain of FORBIDDEN_DOMAINS) {
    if (hostname.includes(domain)) {
      return { ok: false, error: 'Enlace bloqueado por el filtro de seguridad de Kyrn Links (Contenido para adultos prohibido).' };
    }
  }

  // 5. Shady nested shorteners
  for (const shortener of BLOCKED_SHORTENERS) {
    if (hostname.includes(shortener)) {
      return { ok: false, error: 'No se permite anidar otros acortadores de enlaces publicitarios o invasivos.' };
    }
  }

  // 6. Keywords in path / query
  for (const kw of FORBIDDEN_KEYWORDS) {
    if (fullPath.includes(kw) || hostname.includes(kw)) {
      return { ok: false, error: 'Enlace bloqueado: El contenido detectado infringe nuestras políticas de seguridad y contenido apto.' };
    }
  }

  return { ok: true, cleanUrl: parsed.href, hostname: parsed.hostname };
}

function generateRandomSlug(length = 6) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const kv = env?.KYRNFORGE_KV || env?.KV || env?.DB || env?.kyrnforge_kv;

    if (!kv) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Base de datos temporalmente no disponible. Inténtalo en unos momentos.' 
      }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';

    // 1. IP Rate Limiting (Anti-Spam / Protect KV write quotas)
    // Max 10 links per 10 minutes per IP
    const rateKey = `rate_sh_${clientIp}`;
    const currentRate = (await kv.get(rateKey, { type: 'json' })) || 0;
    if (currentRate >= 10) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Has alcanzado el límite de 10 enlaces por cada 10 minutos. Espera un momento antes de acortar más.' 
      }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Global Daily Safety Cap (Max 400 links/day to guarantee 100% free Cloudflare tier)
    const todayStr = new Date().toISOString().slice(0, 10);
    const dailyCapKey = `daily_sh_${todayStr}`;
    const currentDaily = (await kv.get(dailyCapKey, { type: 'json' })) || 0;
    if (currentDaily >= 400) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'El servicio ha alcanzado su cuota diaria de seguridad de enlaces comunitarios. Vuelve mañana.' 
      }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.url) {
      return new Response(JSON.stringify({ ok: false, error: 'Debes proporcionar una URL válida.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Validate Safety
    const safetyResult = validateSafeUrl(body.url.trim());
    if (!safetyResult.ok) {
      return new Response(JSON.stringify({ ok: false, error: safetyResult.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Determine Slug
    let slug = '';
    const customSlug = (body.customSlug || '').trim().toLowerCase();
    const RESERVED_SLUGS = ['api', 'app', 'mod', 'links', 'assets', 'data', 'projects', 'go', 'l', 'favicon', 'robots'];

    if (customSlug) {
      if (!/^[a-z0-9-_]{3,30}$/.test(customSlug)) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: 'El alias personalizado debe tener entre 3 y 30 caracteres (letras, números y guiones únicamente).' 
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      if (RESERVED_SLUGS.includes(customSlug)) {
        return new Response(JSON.stringify({ ok: false, error: 'Ese alias está reservado por el sistema.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if already taken
      const existing = await kv.get(`link_${customSlug}`, { type: 'json' });
      if (existing) {
        return new Response(JSON.stringify({ ok: false, error: 'Ese alias ya está en uso. Prueba con otro nombre.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      slug = customSlug;
    } else {
      // Generate unique slug
      for (let attempts = 0; attempts < 5; attempts++) {
        const candidate = generateRandomSlug(6);
        const existing = await kv.get(`link_${candidate}`, { type: 'json' });
        if (!existing) {
          slug = candidate;
          break;
        }
      }
      if (!slug) slug = generateRandomSlug(7);
    }

    // 5. Store Link with 90-day auto-expiry (keeps KV clean and prevents unbounded storage)
    const linkData = {
      slug,
      targetUrl: safetyResult.cleanUrl,
      hostname: safetyResult.hostname,
      title: body.title ? String(body.title).trim().slice(0, 100) : safetyResult.hostname,
      createdAt: new Date().toISOString()
    };

    // 90 days in seconds
    const TTL_SECONDS = 90 * 24 * 60 * 60;
    await Promise.all([
      kv.put(`link_${slug}`, JSON.stringify(linkData), { expirationTtl: TTL_SECONDS }),
      kv.put(rateKey, JSON.stringify(currentRate + 1), { expirationTtl: 600 }), // 10 minutes
      kv.put(dailyCapKey, JSON.stringify(currentDaily + 1), { expirationTtl: 86400 }) // 24 hours
    ]);

    const origin = new URL(request.url).origin;
    const shortUrl = `${origin}/l/${slug}`;

    return new Response(JSON.stringify({
      ok: true,
      slug,
      shortUrl,
      targetUrl: safetyResult.cleanUrl,
      hostname: safetyResult.hostname,
      createdAt: linkData.createdAt
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Error interno al procesar el enlace: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
