import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { IdleAnimation, RunningAnimation, SkinViewer, WalkingAnimation } from 'skinview3d';

const TOKEN_KEY = 'kyrn_skins_token';
export const NAME_RE = /^[A-Za-z0-9_]{3,16}$/;

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// ---------- Sesión ----------

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
  });
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const setToken = useCallback((t) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch { /* sin almacenamiento */ }
    setTokenState(t);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) { setMe(null); setLoading(false); return null; }
    try {
      const data = await api('/api/v1/skins/me', { token });
      setMe(data);
      return data;
    } catch {
      setToken('');
      setMe(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, setToken]);

  useEffect(() => { refresh(); }, [refresh]);

  const logout = () => { setToken(''); setMe(null); };
  return (
    <SessionContext.Provider value={{ token, me, loading, setToken, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);

// ---------- Imágenes ----------

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function imageSize(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

/// Visor 3D. `animation`: walk, run o idle.
export function Skin3D({ src, slim, width = 300, height = 400, animation = 'walk', rotate = true }) {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = new SkinViewer({ canvas: canvasRef.current, width, height });
    viewer.zoom = 0.85;
    viewerRef.current = viewer;
    return () => viewer.dispose();
  }, [width, height]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.animation = animation === 'run' ? new RunningAnimation() : animation === 'idle' ? new IdleAnimation() : new WalkingAnimation();
    viewer.animation.speed = animation === 'run' ? 0.8 : 0.6;
    viewer.autoRotate = rotate;
    viewer.autoRotateSpeed = 0.6;
  }, [animation, rotate, width, height]);

  useEffect(() => {
    if (src) viewerRef.current?.loadSkin(src, { model: slim ? 'slim' : 'default' });
    else viewerRef.current?.resetSkin();
  }, [src, slim, width, height]);

  return <canvas ref={canvasRef} className="max-w-full" />;
}

/// Figura plana de frente (para la galería y las listas).
export function SkinFront({ src, slim, scale = 4 }) {
  const ref = useRef(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ctx = ref.current?.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 16, 32);
      const legacy = img.naturalHeight === 32;
      const arm = slim ? 3 : 4;
      const parts = [
        [8, 8, 8, 8, 4, 0], [40, 8, 8, 8, 4, 0], [20, 20, 8, 12, 4, 8],
        [44, 20, arm, 12, 4 - arm, 8], [4, 20, 4, 12, 4, 20],
        legacy ? [44, 20, arm, 12, 12, 8] : [36, 52, arm, 12, 12, 8],
        legacy ? [4, 20, 4, 12, 8, 20] : [20, 52, 4, 12, 8, 20],
      ];
      for (const [sx, sy, w, h, dx, dy] of parts) ctx.drawImage(img, sx, sy, w, h, dx, dy, w, h);
    };
    img.src = src;
  }, [src, slim]);
  return <canvas ref={ref} width={16} height={32} style={{ width: 16 * scale, height: 32 * scale }} />;
}

export function Alert({ message }) {
  if (!message) return null;
  return <div className={`mcs-alert ${message.kind === 'ok' ? 'ok' : 'bad'}`}>{message.text}</div>;
}

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`mcs-panel p-4 sm:p-5 grid gap-4 content-start ${className}`}>
      {title && <h2 className="mcs-title text-base sm:text-lg uppercase">{title}</h2>}
      {children}
    </section>
  );
}
