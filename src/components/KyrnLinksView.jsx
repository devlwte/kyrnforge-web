import React, { useState } from 'react';
import { 
  Link2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  AlertCircle, 
  QrCode, 
  Globe, 
  SlidersHorizontal, 
  Sun, 
  Moon, 
  Zap 
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'kyrn_recent_links_v1';
const THEME_STORAGE_KEY = 'kyrn_links_theme_v1';

export default function KyrnLinksView({ onNavigateHome }) {
  const [targetUrl, setTargetUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successLink, setSuccessLink] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showQr, setShowQr] = useState(false);

  // Theme: Light or Dark mode (persisted in localStorage, defaults to dark)
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) return savedTheme === 'dark';
      return true; // Default dark
    } catch (_) {
      return true;
    }
  });

  // Recent links persisted in localStorage
  const [recentLinks, setRecentLinks] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      } catch (_) {}
      return next;
    });
  };

  const saveToLocalHistory = (newLink) => {
    try {
      const updated = [newLink, ...recentLinks.filter(l => l.slug !== newLink.slug)].slice(0, 15);
      setRecentLinks(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const removeFromHistory = (slug) => {
    const updated = recentLinks.filter(l => l.slug !== slug);
    setRecentLinks(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const handleCopy = (text, id = 'main') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessLink(null);
    setShowQr(false);

    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      setErrorMsg('Por favor ingresa un enlace para acortar.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setErrorMsg('El enlace debe comenzar con https:// o http://');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          customSlug: customSlug.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'No se pudo acortar el enlace. Verifica los datos.');
      } else {
        const fullShortUrl = data.shortUrl || `${window.location.origin}/l/${data.slug}`;
        const linkItem = {
          slug: data.slug,
          shortUrl: fullShortUrl,
          targetUrl: data.targetUrl || cleanUrl,
          hostname: data.hostname || new URL(cleanUrl).hostname,
          createdAt: data.createdAt || new Date().toISOString()
        };
        setSuccessLink(linkItem);
        saveToLocalHistory(linkItem);
        setTargetUrl('');
        setCustomSlug('');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${
      isDark ? 'bg-[#090d16] text-[#f1f5f9]' : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      
      {/* Top Header Navigation */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark ? 'border-[#1e263d] bg-[#090d16]/90' : 'border-[#e2e8f0] bg-white/90'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateHome}
              className={`text-xs font-medium transition flex items-center space-x-1.5 py-1 px-2.5 rounded-lg ${
                isDark ? 'text-[#94a3b8] hover:text-white hover:bg-[#141b2c]' : 'text-[#64748b] hover:text-black hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>KyrnForge</span>
            </button>
            <span className={isDark ? 'text-[#2a3450]' : 'text-slate-300'}>/</span>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
                <Link2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Kyrn Links</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs font-medium transition flex items-center space-x-1.5 ${
                isDark 
                  ? 'bg-[#141a29] border-[#222c44] text-[#94a3b8] hover:text-amber-400 hover:border-amber-500/40' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm'
              }`}
              title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label="Alternar tema claro y oscuro"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline text-[11px] font-mono">
                {isDark ? 'Claro' : 'Oscuro'}
              </span>
            </button>

            <span className="hidden sm:flex text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Filtro Seguro</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        
        {/* Clean Modern Hero */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            isDark ? 'bg-[#121827] border-[#1e263d] text-[#818cf8]' : 'bg-indigo-50 border-indigo-100 text-indigo-700'
          }`}>
            <Zap className="w-3.5 h-3.5" />
            <span>Acortador público y seguro · Red Edge Global</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Enlaces cortos, limpios y confiables
          </h1>
          <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${
            isDark ? 'text-[#94a3b8]' : 'text-slate-600'
          }`}>
            Comparte enlaces seguros protegidos contra spam, malware y contenido para adultos. Sin registro obligatorio y listo en 1 clic.
          </p>
        </div>

        {/* Shortener Card */}
        <div className={`border rounded-2xl p-6 sm:p-8 transition-all shadow-xl ${
          isDark 
            ? 'bg-[#111625] border-[#1e263d] shadow-black/25' 
            : 'bg-white border-slate-200/80 shadow-slate-200/50'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input URL */}
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold flex items-center justify-between ${
                isDark ? 'text-[#cbd5e1]' : 'text-slate-700'
              }`}>
                <span>Ingresa el enlace que deseas acortar</span>
                <span className={`text-[11px] font-mono ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>
                  HTTPS o HTTP
                </span>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  isDark ? 'text-[#64748b]' : 'text-slate-400'
                }`}>
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://ejemplo.com/recurso-o-documento-largo..."
                  required
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm transition outline-none ${
                    isDark 
                      ? 'bg-[#090d16] border-[#1e263d] text-[#f1f5f9] placeholder-[#475569] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/25 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Custom Alias Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className={`text-xs font-medium flex items-center space-x-1.5 transition ${
                  isDark ? 'text-[#818cf8] hover:text-[#a5b4fc]' : 'text-indigo-600 hover:text-indigo-700'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{showOptions ? 'Ocultar opciones avanzadas' : 'Personalizar alias corto (opcional)'}</span>
              </button>

              {showOptions && (
                <div className={`mt-3 p-3.5 rounded-xl border space-y-1.5 ${
                  isDark ? 'bg-[#090d16] border-[#1e263d]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className={`text-[11px] font-medium ${isDark ? 'text-[#94a3b8]' : 'text-slate-600'}`}>
                    Alias personalizado
                  </label>
                  <div className="flex items-center">
                    <span className={`text-xs px-2.5 py-2 rounded-l-lg font-mono border border-r-0 ${
                      isDark ? 'bg-[#141a29] border-[#1e263d] text-[#64748b]' : 'bg-slate-200 border-slate-300 text-slate-500'
                    }`}>
                      kyrnforge.dev/l/
                    </span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      placeholder="mi-enlace"
                      className={`flex-1 border rounded-r-lg px-3 py-2 text-xs font-mono outline-none ${
                        isDark 
                          ? 'bg-[#0d121f] border-[#1e263d] text-[#f1f5f9] focus:border-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                  <p className={`text-[10px] ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>
                    Solo letras, números y guiones. Mínimo 3 caracteres.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Verificando y acortando...</span>
              ) : (
                <>
                  <span>ACORTAR ENLACE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Success Generated Card */}
          {successLink && (
            <div className={`p-4 sm:p-5 rounded-xl border space-y-3 mt-5 transition-all animate-in fade-in ${
              isDark 
                ? 'bg-[#151c2e] border-indigo-500/40' 
                : 'bg-indigo-50/70 border-indigo-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-500 flex items-center space-x-1.5">
                  <Check className="w-4 h-4" />
                  <span>¡Enlace generado exitosamente!</span>
                </span>
                <span className={`text-[11px] font-mono ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>
                  {successLink.hostname}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={successLink.shortUrl}
                  className={`flex-1 border rounded-lg px-3 py-2 text-xs font-mono select-all outline-none ${
                    isDark 
                      ? 'bg-[#090d16] border-[#1e263d] text-indigo-300' 
                      : 'bg-white border-slate-200 text-indigo-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(successLink.shortUrl, 'new')}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
                >
                  {copiedId === 'new' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'new' ? '¡Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className={`p-2 rounded-lg border transition ${
                    isDark 
                      ? 'bg-[#1b2235] border-[#222c44] text-[#94a3b8] hover:text-white' 
                      : 'bg-white border-slate-200 text-slate-600 hover:text-black'
                  }`}
                  title="Ver código QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* QR Code display */}
              {showQr && (
                <div className="pt-2 text-center flex flex-col items-center">
                  <div className="p-3 bg-white rounded-xl shadow-md border inline-block">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(successLink.shortUrl)}`}
                      alt="Código QR del enlace"
                      className="w-32 h-32"
                    />
                  </div>
                  <span className={`text-[11px] mt-2 ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>
                    Escanea para abrir en cualquier móvil
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- PROMINENT SPONSOR AD SHOWCASE (High Viewability Banner) --- */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark 
            ? 'bg-[#111625] border-[#1e263d]' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-[11px] mb-3">
            <span className={`font-bold uppercase tracking-wider text-[10px] ${
              isDark ? 'text-[#64748b]' : 'text-slate-400'
            }`}>
              Anuncio Patrocinado
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
              isDark 
                ? 'bg-[#161c2e] text-indigo-400 border-indigo-500/20' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}>
              Publicidad Ética &amp; DevTools
            </span>
          </div>

          {/* High Viewability Simulated Ad */}
          <a
            href="https://kyrnforge.dev"
            target="_blank"
            rel="noopener sponsored"
            className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition gap-4 text-left group ${
              isDark 
                ? 'bg-[#0d121f] border-[#1e263d] hover:border-indigo-500/40' 
                : 'bg-slate-50 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30'
            }`}
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-xl flex-shrink-0 shadow-md shadow-indigo-600/30">
                ⚡
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-sm font-bold transition truncate ${
                    isDark ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'
                  }`}>
                    Servidores Cloud NVMe &amp; VPS Ultrarrápidos
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    OFERTA DEV
                  </span>
                </div>
                <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>
                  Despliega microservicios y APIs locales a producción en 55 segundos. Tráfico ilimitado y 99.9% uptime.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-auto">
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm flex items-center space-x-1 group-hover:bg-indigo-500 transition">
                <span>Ver Planes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </a>
        </div>

        {/* Local History Section (Saved in this browser) */}
        {recentLinks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-[#94a3b8]' : 'text-slate-500'
              }`}>
                Tus Enlaces Recientes (Este dispositivo)
              </h2>
              <span className={`text-[11px] ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>
                {recentLinks.length} guardado{recentLinks.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2">
              {recentLinks.map((item) => (
                <div
                  key={item.slug}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isDark 
                      ? 'bg-[#111625] border-[#1e263d] hover:border-[#2a3554]' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-500">
                        /l/{item.slug}
                      </span>
                      <span className={isDark ? 'text-[#64748b]' : 'text-slate-300'}>·</span>
                      <span className={`text-[11px] truncate max-w-[220px] sm:max-w-xs ${
                        isDark ? 'text-[#94a3b8]' : 'text-slate-600'
                      }`} title={item.targetUrl}>
                        {item.hostname}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleCopy(item.shortUrl, item.slug)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border flex items-center space-x-1 transition ${
                        isDark 
                          ? 'bg-[#182033] border-[#242f4c] text-[#cbd5e1] hover:text-white' 
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Copiar enlace"
                    >
                      {copiedId === item.slug ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === item.slug ? 'Copiado' : 'Copiar'}</span>
                    </button>
                    <a
                      href={item.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1.5 rounded-lg border transition ${
                        isDark 
                          ? 'bg-[#182033] border-[#242f4c] text-[#94a3b8] hover:text-white' 
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-black'
                      }`}
                      title="Probar enlace"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => removeFromHistory(item.slug)}
                      className={`p-1.5 rounded-lg transition ${
                        isDark 
                          ? 'text-[#64748b] hover:text-rose-400 hover:bg-rose-950/20' 
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Eliminar de la lista local"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 text-xs">
          <div className={`p-4 rounded-xl border space-y-1.5 ${
            isDark ? 'bg-[#111625] border-[#1e263d]' : 'bg-white border-slate-200'
          }`}>
            <span className="text-base">🛡️</span>
            <h3 className="font-bold">Filtro de Seguridad</h3>
            <p className={`leading-relaxed text-[11px] ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>
              Inspección de URLs contra contenido para adultos, phishing y malware.
            </p>
          </div>
          <div className={`p-4 rounded-xl border space-y-1.5 ${
            isDark ? 'bg-[#111625] border-[#1e263d]' : 'bg-white border-slate-200'
          }`}>
            <span className="text-base">⚡</span>
            <h3 className="font-bold">Edge CDN Global</h3>
            <p className={`leading-relaxed text-[11px] ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>
              Redirección ultrarrápida respaldada por Cloudflare en más de 300 centros mundiales.
            </p>
          </div>
          <div className={`p-4 rounded-xl border space-y-1.5 ${
            isDark ? 'bg-[#111625] border-[#1e263d]' : 'bg-white border-slate-200'
          }`}>
            <span className="text-base">⏱️</span>
            <h3 className="font-bold">Espera Estándar de 5s</h3>
            <p className={`leading-relaxed text-[11px] ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>
              Página de destino limpia y profesional con salto directo al destino.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className={`border-t py-8 text-center text-xs transition-colors ${
        isDark ? 'border-[#1e263d] text-[#64748b]' : 'border-slate-200 text-slate-400'
      }`}>
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 KyrnForge · Kyrn Links Gateway</span>
          <div className="flex items-center space-x-4">
            <button onClick={onNavigateHome} className="hover:underline">Inicio</button>
            <span>·</span>
            <a href="mailto:abuse@kyrnforge.dev" className="hover:text-rose-400 transition">Reportar Enlace</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
