import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Terminal, 
  Download, 
  ExternalLink, 
  Cpu, 
  Layers, 
  Gamepad2, 
  Code2, 
  Package, 
  Activity,
  ArrowRight,
  Zap,
  ShoppingBag,
  Sparkles,
  Server,
  Key,
  Globe2,
  CheckCircle,
  Copy,
  Check,
  ChevronLeft,
  Share2,
  Info,
  Clock,
  ArrowLeft
} from 'lucide-react';

const ICON_MAP = {
  Shield,
  Layers,
  Cpu,
  Server,
  Zap,
  Terminal,
  Gamepad2,
  ShoppingBag,
  Code2,
  Package,
  Sparkles,
  Download,
  Key,
  Globe2,
  Activity
};

export default function AppDetailView({ appId, availableApps = [], projects = [], onNavigateHome, onNavigateApp }) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Search app in availableApps first, then in projects catalog
  const appInCarousel = availableApps.find(a => a.id === appId || a.id === appId.toLowerCase());
  const projectInCatalog = projects.find(p => p.id === appId || p.id === appId.toLowerCase());

  // Merge attributes to get the richest possible representation
  const app = appInCarousel || (projectInCatalog ? {
    id: projectInCatalog.id,
    title: projectInCatalog.title,
    shortName: projectInCatalog.title,
    category: projectInCatalog.categoryLabel || 'Herramienta de Escritorio',
    badge: projectInCatalog.statusLabel || 'v1.0.0 Oficial',
    badgeColor: projectInCatalog.badgeColor || 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
    description: projectInCatalog.description,
    iconImg: projectInCatalog.iconImg || '/projects/default-app.svg',
    downloadUrl: projectInCatalog.downloadUrl || (projectInCatalog.repoUrl ? `${projectInCatalog.repoUrl}/releases` : null),
    repoUrl: projectInCatalog.repoUrl || null,
    features: (projectInCatalog.tags || []).map(tag => ({
      label: tag,
      iconName: 'Zap',
      color: 'text-cyan-400'
    })),
    glowClass: 'glow-emerald',
    themeBorder: 'border-emerald-500/40',
    btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25',
    accentText: 'text-emerald-400'
  } : null);

  // Update client document title on mount / change
  useEffect(() => {
    if (app && app.title) {
      document.title = `${app.title} · Ecosistema de Software KyrnForge`;
    } else {
      document.title = 'App no encontrada · KyrnForge';
    }
    window.scrollTo(0, 0);
  }, [app]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Other related apps to explore
  const relatedApps = availableApps.filter(a => a.id !== appId);

  if (!app) {
    return (
      <div className="min-h-screen bg-[#06070a] text-zinc-100 font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-mono text-zinc-100 mb-2">Aplicación no encontrada</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          No existe ninguna aplicación registrada con el identificador <code className="text-cyan-400 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">/app/{appId}</code>.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo Oficial</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 font-sans bg-tech-grid relative overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-100px] left-[20%] w-[500px] h-[500px] bg-cyan-950/20 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] -right-20 w-[500px] h-[500px] bg-emerald-950/15 blur-[160px] rounded-full" />
      </div>

      {/* Top Nav / Breadcrumbs Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#06070a]/90 border-b border-zinc-900/80 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs transition active:scale-95 flex-shrink-0"
              title="Volver a la página principal"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
              <span className="hidden sm:inline">Ecosistema</span>
            </button>

            <span className="text-zinc-600 font-mono text-xs hidden sm:inline">/</span>

            <div className="flex items-center space-x-2 truncate">
              <span className="font-mono text-xs text-zinc-400 hidden sm:inline">Apps</span>
              <span className="text-zinc-600 font-mono text-xs hidden sm:inline">/</span>
              <span className="font-mono font-bold text-xs sm:text-sm text-zinc-100 truncate">{app.title}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs transition"
              title="Copiar enlace directo a esta app"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">

        {/* HERO SECTION */}
        <section className="p-6 sm:p-10 rounded-3xl bg-[#080b12] border border-zinc-800/90 relative overflow-hidden shadow-2xl">
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-10">
            
            {/* App Icon Container */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-[#0c101c] border border-zinc-700/60 p-4 sm:p-5 flex items-center justify-center flex-shrink-0 shadow-xl shadow-cyan-950/20 group">
              <img 
                src={app.iconImg || '/projects/default-app.svg'} 
                alt={`${app.title} Icon`}
                className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* App Info & Action Buttons */}
            <div className="flex-1 min-w-0 space-y-4">
              
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full border ${app.badgeColor || 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'}`}>
                  {app.badge || 'v1.0.0 Oficial'}
                </span>
                <span className="text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {app.category || 'Herramienta de Escritorio'}
                </span>
                <span className="text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/30 text-cyan-300 border border-cyan-500/20 flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  <span>Verificado</span>
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight font-sans">
                  {app.title}
                </h1>
                {app.metaInfo && (
                  <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
                    {app.metaInfo}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-sans">
                {app.description}
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {app.downloadUrl && (
                  <a
                    href={app.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs sm:text-sm font-bold transition shadow-lg shadow-cyan-500/25 active:scale-95 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{app.downloadLabel || 'DESCARGAR SETUP'}</span>
                  </a>
                )}

                {app.repoUrl && (
                  <a
                    href={app.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-mono text-xs sm:text-sm transition flex items-center space-x-2"
                  >
                    <Code2 className="w-4 h-4 text-zinc-400" />
                    <span>Repositorio GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        {app.features && app.features.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-wider flex items-center space-x-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Capacidades Principales &amp; Arquitectura</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {app.features.map((feat, idx) => {
                const IconComponent = ICON_MAP[feat.iconName] || Zap;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#080b12] border border-zinc-800/80 hover:border-zinc-700/90 transition-all space-y-2 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <IconComponent className={`w-4 h-4 ${feat.color || 'text-cyan-400'}`} />
                    </div>
                    <h3 className="font-mono text-sm font-bold text-zinc-100">
                      {feat.label}
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      Optimizado y probado exhaustivamente para un rendimiento confiable y baja latencia.
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TECHNICAL DETAILS & PRIVACY SPEC */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#090c14] border border-zinc-800/80 space-y-6">
          <h2 className="text-sm font-mono text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Ficha Técnica &amp; Garantía de Privacidad</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Arquitectura</span>
              <span className="text-xs font-mono font-bold text-zinc-200">Rust Core / Tauri v2</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Licencia</span>
              <span className="text-xs font-mono font-bold text-emerald-400">Freeware Comunitario</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Privacidad</span>
              <span className="text-xs font-mono font-bold text-cyan-400">100% Local (Zero Leaks)</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Infraestructura</span>
              <span className="text-xs font-mono font-bold text-purple-400">Cloudflare Edge Sync</span>
            </div>
          </div>

          <div className="text-xs text-zinc-400 font-sans leading-relaxed border-t border-zinc-800/80 pt-4 flex items-start space-x-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Soberanía Local Garantizada:</strong> Esta aplicación no transmite código fuente, variables de entorno ni datos que transiten por tus sockets. La ejecución y diagnóstico se procesan exclusivamente en tu procesador local.
            </span>
          </div>
        </section>

        {/* RELATED APPS / EXPLORE MORE */}
        {relatedApps.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Otras Herramientas del Ecosistema KyrnForge</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedApps.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => onNavigateApp(rel.id)}
                  className="p-5 rounded-2xl bg-[#080b12] hover:bg-[#0c101a] border border-zinc-800/80 hover:border-zinc-700 transition text-left space-y-3 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0c101c] border border-zinc-800 p-2 flex items-center justify-center flex-shrink-0">
                      <img src={rel.iconImg || '/projects/default-app.svg'} alt={rel.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-mono text-xs font-bold text-zinc-200 truncate group-hover:text-cyan-300 transition-colors">
                        {rel.title}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {rel.badge || 'Oficial'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {rel.description}
                  </p>
                  <div className="text-[11px] font-mono text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center space-x-1 pt-1">
                    <span>Ver Ficha Oficial</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 bg-[#06070a] py-8 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© 2026 KyrnForge · Ecosistema Independiente de Herramientas de Escritorio</p>
          <div className="flex justify-center items-center space-x-4">
            <button onClick={onNavigateHome} className="hover:text-zinc-300 transition">Inicio</button>
            <span>•</span>
            <a href="https://github.com/devlwte" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition">GitHub</a>
            <span>•</span>
            <a href="https://kyrnforge.dev" className="hover:text-zinc-300 transition">kyrnforge.dev</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
