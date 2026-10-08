import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  Trash2, 
  AlertCircle, 
  QrCode,
  Globe,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'kyrn_recent_links_v1';

export default function KyrnLinksView({ onNavigateHome }) {
  const [targetUrl, setTargetUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successLink, setSuccessLink] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [recentLinks, setRecentLinks] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [showQr, setShowQr] = useState(false);

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
    <div className="min-h-screen bg-[#0c0e14] text-[#f1f5f9] font-sans selection:bg-indigo-500/20 selection:text-indigo-200">
      
      {/* Top Soft Navigation Bar */}
      <header className="border-b border-[#1c2130] bg-[#0c0e14]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateHome}
              className="text-xs font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition flex items-center space-x-1.5 py-1 px-2 rounded-lg hover:bg-[#161924]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>KyrnForge</span>
            </button>
            <span className="text-[#333a4d]">/</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-[#1e2333] border border-[#2b334a] flex items-center justify-center text-[#818cf8]">
                <Link2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-[#f1f5f9] tracking-tight">Kyrn Links</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Protección Activa</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        
        {/* Soft Zen Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161926] border border-[#23293d] text-xs font-medium text-[#a5b4fc] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#818cf8]" />
            <span>Filtro estricto contra spam, malware y contenido para adultos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] tracking-tight">
            Enlaces limpios, cortos y seguros.
          </h1>
          <p className="text-sm sm:text-base text-[#94a3b8] max-w-xl mx-auto leading-relaxed">
            Acorta cualquier enlace al instante sin necesidad de registrarte. Tus enlaces se almacenan de forma segura en la red global de Cloudflare.
          </p>
        </div>

        {/* Shortener Card */}
        <div className="bg-[#141722] border border-[#212638] rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#cbd5e1] flex items-center justify-between">
                <span>Pega tu enlace original</span>
                <span className="text-[11px] text-[#64748b]">HTTPS o HTTP</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748b]">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://ejemplo.com/tu-enlace-muy-largo..."
                  required
                  className="w-full bg-[#0d0f16] border border-[#23283a] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] transition outline-none"
                />
              </div>
            </div>

            {/* Custom Alias Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="text-xs text-[#94a3b8] hover:text-[#cbd5e1] font-medium flex items-center space-x-1.5 transition"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#818cf8]" />
                <span>{showOptions ? 'Ocultar alias personalizado' : 'Personalizar alias corto (opcional)'}</span>
              </button>

              {showOptions && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#0d0f16] border border-[#23283a] space-y-1.5">
                  <label className="text-[11px] font-medium text-[#94a3b8]">Alias deseado</label>
                  <div className="flex items-center">
                    <span className="text-xs text-[#64748b] bg-[#161a26] border border-r-0 border-[#23283a] px-2.5 py-2 rounded-l-lg font-mono">
                      kyrnforge.dev/l/
                    </span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      placeholder="mi-enlace"
                      className="flex-1 bg-[#10121a] border border-[#23283a] focus:border-[#6366f1] rounded-r-lg px-3 py-2 text-xs font-mono text-[#f1f5f9] outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-[#64748b]">
                    Solo letras, números y guiones. Mínimo 3 caracteres.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-semibold transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Verificando y acortando...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>ACORTAR ENLACE SEGURO</span>
                </>
              )}
            </button>
          </form>

          {/* Success Generated Card */}
          {successLink && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#181d2b] border border-indigo-500/30 space-y-3 transition-all animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Enlace creado con éxito!</span>
                </span>
                <span className="text-[10px] text-[#94a3b8] font-mono">
                  {successLink.hostname}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={successLink.shortUrl}
                  className="flex-1 bg-[#0c0e14] border border-[#23293d] rounded-lg px-3 py-2 text-xs font-mono text-[#a5b4fc] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(successLink.shortUrl, 'new')}
                  className="px-3.5 py-2 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-medium flex items-center space-x-1.5 transition"
                >
                  {copiedId === 'new' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'new' ? '¡Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="p-2 rounded-lg bg-[#1e2333] hover:bg-[#282f45] border border-[#2b334a] text-[#94a3b8] hover:text-[#f1f5f9] transition"
                  title="Ver código QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* QR Code display */}
              {showQr && (
                <div className="pt-2 text-center flex flex-col items-center">
                  <div className="p-3 bg-white rounded-xl shadow-md inline-block">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(successLink.shortUrl)}`}
                      alt="Código QR del enlace"
                      className="w-32 h-32"
                    />
                  </div>
                  <span className="text-[11px] text-[#64748b] mt-2">Escanea para abrir en móvil</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- STRATEGIC NON-INTRUSIVE AD BANNER (Focal Area) --- */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#11141e] border border-[#1d2232] space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span className="font-medium uppercase tracking-wider text-[10px]">Espacio Patrocinado</span>
            <span className="px-2 py-0.5 rounded bg-[#161a28] text-[#818cf8] text-[10px]">Publicidad Ética para Desarrolladores</span>
          </div>

          {/* 
            SIMULACRO DE ANUNCIO:
            Sustituir por el snippet oficial de EthicalAds o Carbon Ads al ser aprobado.
          */}
          <a
            href="https://kyrnforge.dev"
            target="_blank"
            rel="noopener sponsored"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-[#151926] hover:bg-[#1a1f30] border border-[#23293a] transition gap-3 text-left group"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md shadow-indigo-900/30">
                ⚡
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[#f1f5f9] group-hover:text-indigo-300 transition truncate">
                  Cloud VPS &amp; Infraestructura Ligera para Desarrolladores
                </h4>
                <p className="text-[11px] text-[#94a3b8] line-clamp-1">
                  Despliega tus runtimes y APIs con latencia mínima, discos NVMe y discos ultra-rápidos desde $3.50/mes.
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-indigo-400 group-hover:text-indigo-300 flex items-center space-x-1 flex-shrink-0 self-end sm:self-auto">
              <span>Más info</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>

        {/* Local History Section (Saved in this browser) */}
        {recentLinks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Tus Enlaces Recientes (Este dispositivo)
              </h2>
              <span className="text-[11px] text-[#64748b]">
                {recentLinks.length} enlace{recentLinks.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2">
              {recentLinks.map((item) => (
                <div
                  key={item.slug}
                  className="p-3.5 rounded-xl bg-[#131622] border border-[#202536] hover:border-[#2a3147] transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-semibold text-[#a5b4fc]">
                        /l/{item.slug}
                      </span>
                      <span className="text-[10px] text-[#64748b]">·</span>
                      <span className="text-[11px] text-[#94a3b8] truncate max-w-[200px] sm:max-w-xs" title={item.targetUrl}>
                        {item.hostname}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleCopy(item.shortUrl, item.slug)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1b2030] hover:bg-[#252c42] text-[11px] font-medium text-[#cbd5e1] flex items-center space-x-1 transition"
                      title="Copiar enlace"
                    >
                      {copiedId === item.slug ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === item.slug ? 'Copiado' : 'Copiar'}</span>
                    </button>
                    <a
                      href={item.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#1b2030] hover:bg-[#252c42] text-[#94a3b8] hover:text-[#f1f5f9] transition"
                      title="Probar enlace"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => removeFromHistory(item.slug)}
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-rose-400 hover:bg-rose-950/20 transition"
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

        {/* Value Proposition & Security Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 text-xs">
          <div className="p-4 rounded-xl bg-[#11141e] border border-[#1d2232] space-y-1.5">
            <span className="text-base">🛡️</span>
            <h3 className="font-semibold text-[#f1f5f9]">Filtro de Seguridad</h3>
            <p className="text-[#94a3b8] leading-relaxed text-[11px]">
              Inspección de URLs contra contenido para adultos, phishing y acortadores maliciosos.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#11141e] border border-[#1d2232] space-y-1.5">
            <span className="text-base">⚡</span>
            <h3 className="font-semibold text-[#f1f5f9]">Edge CDN Global</h3>
            <p className="text-[#94a3b8] leading-relaxed text-[11px]">
              Redirección ultrarrápida respaldada por Cloudflare en más de 300 centros de datos mundiales.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#11141e] border border-[#1d2232] space-y-1.5">
            <span className="text-base">✨</span>
            <h3 className="font-semibold text-[#f1f5f9]">100% Sin Registro</h3>
            <p className="text-[#94a3b8] leading-relaxed text-[11px]">
              Uso inmediato y libre de burocracia con historial local en tu navegador.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1c2130] py-8 text-center text-xs text-[#64748b]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 KyrnForge · Kyrn Links Public Gateway</span>
          <div className="flex items-center space-x-4">
            <button onClick={onNavigateHome} className="hover:text-[#94a3b8] transition">Inicio</button>
            <span>·</span>
            <a href="mailto:abuse@kyrnforge.dev" className="hover:text-rose-400 transition">Reportar Abuso</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
