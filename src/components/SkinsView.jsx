import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SkinViewer, WalkingAnimation } from 'skinview3d';
import {
  ArrowLeft, Upload, Trash2, LogOut, Flag, Search, Check, AlertCircle, Download, Loader2,
} from 'lucide-react';

const TOKEN_KEY = 'kyrn_skins_token';
const NAME_RE = /^[A-Za-z0-9_]{3,16}$/;

async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function imageSize(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

/// Vista 3D giratoria del aspecto.
function Skin3D({ src, slim, className = '' }) {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = new SkinViewer({ canvas: canvasRef.current, width: 300, height: 400 });
    viewer.animation = new WalkingAnimation();
    viewer.animation.speed = 0.6;
    viewer.autoRotate = true;
    viewer.autoRotateSpeed = 0.6;
    viewer.zoom = 0.85;
    viewerRef.current = viewer;
    return () => viewer.dispose();
  }, []);

  useEffect(() => {
    if (src) viewerRef.current?.loadSkin(src, { model: slim ? 'slim' : 'default' });
    else viewerRef.current?.resetSkin();
  }, [src, slim]);

  return <canvas ref={canvasRef} className={className} />;
}

/// Figura plana de frente, para las tarjetas de la galería.
function SkinFront({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ctx = ref.current.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 16, 32);
      const legacy = img.naturalHeight === 32;
      const parts = [
        [8, 8, 8, 8, 4, 0], [40, 8, 8, 8, 4, 0],
        [20, 20, 8, 12, 4, 8], [44, 20, 4, 12, 0, 8], [4, 20, 4, 12, 4, 20],
        legacy ? [44, 20, 4, 12, 12, 8] : [36, 52, 4, 12, 12, 8],
        legacy ? [4, 20, 4, 12, 8, 20] : [20, 52, 4, 12, 8, 20],
      ];
      for (const [sx, sy, w, h, dx, dy] of parts) ctx.drawImage(img, sx, sy, w, h, dx, dy, w, h);
    };
    img.src = src;
  }, [src]);
  return <canvas ref={ref} width={16} height={32} className="w-16 h-32" style={{ imageRendering: 'pixelated' }} />;
}

export default function SkinsView({ onNavigateHome }) {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
  });
  const [me, setMe] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [auth, setAuth] = useState({ name: '', email: '', password: '' });
  const [form, setForm] = useState({ name: '', slim: false, png: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [found, setFound] = useState(null);
  const [reported, setReported] = useState({});

  const notify = (kind, text) => setMessage({ kind, text });

  const loadGallery = useCallback(() => {
    api('/api/v1/skins').then((d) => setGallery(d.skins)).catch(() => {});
  }, []);

  const loadMe = useCallback(async (t) => {
    if (!t) { setMe(null); return; }
    try {
      const d = await api('/api/v1/skins/me', { token: t });
      setMe(d);
      if (d.skin) setForm((f) => ({ ...f, name: d.skin.name, slim: d.skin.model === 'slim', png: f.png || d.skin.url }));
    } catch {
      setToken('');
      try { localStorage.removeItem(TOKEN_KEY); } catch { /* sin almacenamiento */ }
    }
  }, []);

  useEffect(() => { loadGallery(); }, [loadGallery]);
  useEffect(() => { loadMe(token); }, [token, loadMe]);

  const submitAuth = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const path = authMode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const body = authMode === 'login' ? { email: auth.email, password: auth.password } : auth;
      const d = await api(path, { method: 'POST', body });
      try { localStorage.setItem(TOKEN_KEY, d.token); } catch { /* sin almacenamiento */ }
      setToken(d.token);
      setAuth({ name: '', email: '', password: '' });
    } catch (err) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* sin almacenamiento */ }
    setToken('');
    setMe(null);
    setForm({ name: '', slim: false, png: '' });
  };

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'image/png') return notify('error', 'El aspecto debe ser un archivo PNG.');
    if (file.size > 24 * 1024) return notify('error', 'La imagen pesa demasiado (máximo 24 KB).');
    const dataUrl = await fileToDataUrl(file);
    const { width, height } = await imageSize(dataUrl);
    if (width !== 64 || (height !== 64 && height !== 32)) {
      return notify('error', `El aspecto debe medir 64x64; este mide ${width}x${height}.`);
    }
    setMessage(null);
    setFound(null);
    setForm((f) => ({ ...f, png: dataUrl }));
  };

  const publish = async () => {
    if (!NAME_RE.test(form.name)) return notify('error', 'El nombre debe tener de 3 a 16 caracteres: letras, números o _.');
    if (!form.png.startsWith('data:')) return notify('error', 'Elige el PNG de tu aspecto.');
    setBusy(true);
    try {
      await api('/api/v1/skins', {
        method: 'POST', token,
        body: { name: form.name, model: form.slim ? 'slim' : 'classic', png: form.png },
      });
      notify('ok', `Publicado. En xLaunch, «${form.name}» ya lleva este aspecto sin conexión.`);
      await loadMe(token);
      loadGallery();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api('/api/v1/skins', { method: 'DELETE', token });
      setForm({ name: '', slim: false, png: '' });
      notify('ok', 'Aspecto borrado y nombre liberado.');
      await loadMe(token);
      loadGallery();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  const lookup = async (e) => {
    e.preventDefault();
    if (!NAME_RE.test(search)) return setFound({ error: 'Nombre no válido.' });
    try {
      const d = await api(`/api/v1/skins/name/${encodeURIComponent(search)}`);
      setFound(d.skin ? { ...d.skin, source: d.source } : { error: `«${search}» no tiene aspecto publicado.` });
    } catch (err) {
      setFound({ error: err.message });
    }
  };

  const report = async (name) => {
    try {
      await api('/api/v1/skins/report', { method: 'POST', body: { name, reason: 'contenido inapropiado' } });
      setReported((r) => ({ ...r, [name]: true }));
    } catch (err) {
      notify('error', err.message);
    }
  };

  const card = 'rounded-xl border border-[#1e263d] bg-[#0d1322]';
  const input = 'w-full rounded-lg border border-[#1e263d] bg-[#090d16] px-3 py-2.5 text-sm outline-none focus:border-emerald-500';
  const button = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50';

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f1f5f9] font-sans">
      <header className="border-b border-[#1e263d] bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onNavigateHome} className="p-2 rounded-lg hover:bg-[#141b2d]" aria-label="Volver al inicio">
              <ArrowLeft size={18} />
            </button>
            <img src="/skins-icon.png" alt="" className="w-8 h-8 rounded" style={{ imageRendering: 'pixelated' }} />
            <div className="min-w-0">
              <h1 className="font-bold leading-tight truncate">KyrnForge Skins</h1>
              <p className="text-xs text-slate-400 truncate">Aspectos para jugar sin conexión con xLaunch</p>
            </div>
          </div>
          {me && (
            <button onClick={logout} className={`${button} border border-[#1e263d] hover:bg-[#141b2d]`}>
              <LogOut size={16} /><span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid gap-8">
        <section className="grid gap-2 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold">Tu aspecto, también sin conexión</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Publica tu aspecto con tu nombre de jugador. xLaunch lo usa en partidas sin conexión, en LAN y en servidores
            no premium. Los nombres premium muestran automáticamente su aspecto de Mojang y no se pueden reclamar.
          </p>
        </section>

        {message && (
          <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
            message.kind === 'ok' ? 'border-emerald-700 bg-emerald-950/50 text-emerald-300' : 'border-red-800 bg-red-950/50 text-red-300'
          }`}>
            {message.kind === 'ok' ? <Check size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <section className="grid lg:grid-cols-[320px_1fr] gap-6">
          <div className={`${card} p-4 grid place-items-center bg-gradient-to-b from-[#0d1322] to-[#0b1a14]`}>
            <Skin3D
              src={found?.url || form.png || gallery[0]?.url || ''}
              slim={found?.url ? found.model === 'slim' : form.png ? form.slim : gallery[0]?.model === 'slim'}
              className="max-w-full"
            />
          </div>

          {!me ? (
            <form onSubmit={submitAuth} className={`${card} p-5 grid gap-4 content-start`}>
              <div className="flex gap-2">
                {['login', 'register'].map((m) => (
                  <button key={m} type="button" onClick={() => setAuthMode(m)}
                    className={`${button} flex-1 ${authMode === m ? 'bg-emerald-600 text-white' : 'border border-[#1e263d] hover:bg-[#141b2d]'}`}>
                    {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  </button>
                ))}
              </div>
              {authMode === 'register' && (
                <input className={input} placeholder="Tu nombre" value={auth.name} autoComplete="nickname"
                  onChange={(e) => setAuth({ ...auth, name: e.target.value })} />
              )}
              <input className={input} type="email" placeholder="Correo" value={auth.email} autoComplete="email"
                onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
              <input className={input} type="password" placeholder="Contraseña (mínimo 6)" value={auth.password}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
              <button disabled={busy} className={`${button} bg-emerald-600 hover:bg-emerald-500 text-white`}>
                {busy && <Loader2 size={16} className="animate-spin" />}
                {authMode === 'login' ? 'Entrar' : 'Crear cuenta'}
              </button>
              <p className="text-xs text-slate-500">Es la misma cuenta de KyrnForge que usan las demás apps.</p>
            </form>
          ) : (
            <div className={`${card} p-5 grid gap-4 content-start`}>
              <p className="text-sm text-slate-400">Sesión: <span className="text-slate-200">{me.user.name}</span></p>
              <label className="grid gap-1.5 text-sm">
                <span className="text-slate-400">Nombre de jugador</span>
                <input className={input} maxLength={16} placeholder="Ej. Herrero_99" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value.trim() })} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[false, true].map((slim) => (
                  <button key={String(slim)} type="button" onClick={() => setForm({ ...form, slim })}
                    className={`${button} ${form.slim === slim ? 'bg-emerald-600 text-white' : 'border border-[#1e263d] hover:bg-[#141b2d]'}`}>
                    {slim ? 'Brazos finos' : 'Clásico'}
                  </button>
                ))}
              </div>
              <label className={`${button} border border-dashed border-[#2b3654] hover:bg-[#141b2d] cursor-pointer`}>
                <Upload size={16} /> Elegir PNG (64x64)
                <input type="file" accept="image/png" className="hidden" onChange={pickFile} />
              </label>
              <div className="flex flex-wrap gap-2">
                <button disabled={busy} onClick={publish} className={`${button} bg-emerald-600 hover:bg-emerald-500 text-white flex-1`}>
                  {busy && <Loader2 size={16} className="animate-spin" />} Publicar
                </button>
                {me.skin && (
                  <>
                    <a href={me.skin.url} download={`${me.skin.name}.png`} className={`${button} border border-[#1e263d] hover:bg-[#141b2d]`}>
                      <Download size={16} />
                    </a>
                    <button disabled={busy} onClick={remove} className={`${button} border border-red-900 text-red-300 hover:bg-red-950/50`}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
              {me.skin && <p className="text-xs text-slate-500">Publicado como «{me.skin.name}» · UUID sin conexión {me.skin.uuid}</p>}
            </div>
          )}
        </section>

        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-bold">Galería</h2>
            <form onSubmit={lookup} className="flex gap-2 w-full sm:w-auto">
              <input className={`${input} sm:w-56`} placeholder="Buscar un jugador" value={search}
                onChange={(e) => setSearch(e.target.value.trim())} />
              <button className={`${button} border border-[#1e263d] hover:bg-[#141b2d]`} aria-label="Buscar"><Search size={16} /></button>
            </form>
          </div>
          {found && (
            <p className="text-sm text-slate-400">
              {found.error ?? `«${found.name}»: ${found.source === 'mojang' ? 'aspecto premium de Mojang' : 'publicado en KyrnForge Skins'} (se ve en el visor).`}
            </p>
          )}
          {gallery.length === 0 ? (
            <p className="text-slate-500 text-sm">Todavía no hay aspectos publicados. ¡Sé el primero!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {gallery.map((s) => (
                <div key={s.name} className={`${card} p-3 grid justify-items-center gap-2`}>
                  <button onClick={() => setFound({ ...s, source: 'kyrnforge' })} className="p-1 rounded hover:bg-[#141b2d]" title="Ver en 3D">
                    <SkinFront src={s.url} />
                  </button>
                  <span className="text-sm font-semibold truncate max-w-full">{s.name}</span>
                  <button onClick={() => report(s.name)} disabled={reported[s.name]}
                    className="text-xs text-slate-500 hover:text-red-300 inline-flex items-center gap-1 disabled:hover:text-slate-500">
                    <Flag size={12} /> {reported[s.name] ? 'Denunciado' : 'Denunciar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
