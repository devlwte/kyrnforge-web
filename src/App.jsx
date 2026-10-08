import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Terminal, 
  Download, 
  ExternalLink, 
  Cpu, 
  Layers, 
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
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import ModDashboard from './components/ModDashboard';
import AppDetailView from './components/AppDetailView';
import { initialAvailableApps } from './data/defaultApps';
import { initialProjects, initialSiteSettings } from './data/defaultSiteData';

// Icon mapping helper for serializable feature tags
const ICON_MAP = {
  Shield,
  Layers,
  Cpu,
  Server,
  Zap,
  Terminal,
  ShoppingBag,
  Code2,
  Package,
  Sparkles,
  Download,
  Key,
  Globe2,
  Activity
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [projectFilter, setProjectFilter] = useState('all');
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedAppId, setCopiedAppId] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);

  // Synchronize available apps from localStorage (or defaults)
  const [availableApps, setAvailableApps] = useState(() => {
    try {
      const saved = localStorage.getItem('kyrnforge_available_apps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading apps from localStorage", e);
    }
    return initialAvailableApps && initialAvailableApps.length > 0 ? initialAvailableApps : [];
  });

  // Synchronize projects catalog from localStorage (or defaults)
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('kyrnforge_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading projects from localStorage", e);
    }
    return initialProjects && initialProjects.length > 0 ? initialProjects : [];
  });

  // Synchronize site settings (hero & metrics) from localStorage (or defaults)
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('kyrnforge_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.hero) return parsed;
      }
    } catch (e) {
      console.error("Error loading siteSettings from localStorage", e);
    }
    return initialSiteSettings || {};
  });

  // Navigation function that synchronizes URL and document title
  const navigateTo = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (path === '/' || path === '') {
      document.title = 'KyrnForge · Ecosistema de Software & Herramientas de Escritorio';
    }
  }, []);

  // Browser history popstate listener (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/' || path === '') {
        document.title = 'KyrnForge · Ecosistema de Software & Herramientas de Escritorio';
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch latest JSON data from server on startup so updates in KV are reflected for visitors
  useEffect(() => {
    const fetchRemoteData = async () => {
      try {
        const timestamp = Date.now();
        const apiRes = await fetch(`/api/v1/content?t=${timestamp}`, { cache: 'no-store' })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null);

        if (apiRes && apiRes.availableApps && Array.isArray(apiRes.availableApps) && apiRes.availableApps.length > 0) {
          setAvailableApps(apiRes.availableApps);
          localStorage.setItem('kyrnforge_available_apps', JSON.stringify(apiRes.availableApps));
          if (Array.isArray(apiRes.projects) && apiRes.projects.length > 0) {
            setProjects(apiRes.projects);
            localStorage.setItem('kyrnforge_projects', JSON.stringify(apiRes.projects));
          }
          if (apiRes.siteSettings && apiRes.siteSettings.hero) {
            setSiteSettings(apiRes.siteSettings);
            localStorage.setItem('kyrnforge_site_settings', JSON.stringify(apiRes.siteSettings));
          }
          return;
        }

        // Direct static JSON fallback
        const [resApps, resProjects, resSettings] = await Promise.all([
          fetch(`/data/apps.json?t=${timestamp}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/data/projects.json?t=${timestamp}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/data/settings.json?t=${timestamp}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        if (resApps && Array.isArray(resApps) && resApps.length > 0) {
          setAvailableApps(resApps);
          localStorage.setItem('kyrnforge_available_apps', JSON.stringify(resApps));
        }
        if (resProjects && Array.isArray(resProjects) && resProjects.length > 0) {
          setProjects(resProjects);
          localStorage.setItem('kyrnforge_projects', JSON.stringify(resProjects));
        }
        if (resSettings && resSettings.hero) {
          setSiteSettings(resSettings);
          localStorage.setItem('kyrnforge_site_settings', JSON.stringify(resSettings));
        }
      } catch (e) {
        console.warn('Operando con datos cacheados/empaquetados:', e);
      }
    };
    fetchRemoteData();
  }, []);

  // Keyboard navigation for carousel (Left / Right Arrow keys)
  useEffect(() => {
    if (currentPath !== '/' && currentPath !== '') return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentAppIndex(prev => (prev === 0 ? Math.max(0, availableApps.length - 1) : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentAppIndex(prev => (prev === availableApps.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableApps.length, currentPath]);

  // Carousel navigation handlers
  const prevApp = useCallback(() => {
    setCurrentAppIndex(prev => (prev === 0 ? availableApps.length - 1 : prev - 1));
  }, [availableApps.length]);

  const nextApp = useCallback(() => {
    setCurrentAppIndex(prev => (prev === availableApps.length - 1 ? 0 : prev + 1));
  }, [availableApps.length]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextApp();
    } else if (diff < -50) {
      prevApp();
    }
    setTouchStartX(null);
  };

  const copyDownloadUrl = (appId, url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedAppId(appId);
    setTimeout(() => setCopiedAppId(null), 2200);
  };

  // Centralized Navigation Items
  const navItems = [
    { id: 'proyectos', label: 'PROYECTOS', href: '#proyectos' },
    { id: 'descargas', label: 'DESCARGAS', href: '#descargas' },
    { id: 'github', label: 'GITHUB', href: 'https://github.com/devlwte', isExternal: true }
  ];

  // Derive dynamic category filters from existing projects to avoid empty/dead tabs
  const availableCategories = Array.from(new Set((projects || []).map(p => p.categoryLabel || p.category).filter(Boolean)));
  const categoryFilters = [
    { id: 'all', label: `Todos (${(projects || []).length})` },
    ...availableCategories.map(cat => ({
      id: cat,
      label: `${cat} (${(projects || []).filter(p => (p.categoryLabel || p.category) === cat).length})`
    }))
  ];

  const filteredProjects = (projects || []).filter(p => {
    if (projectFilter === 'all') return true;
    return (p.categoryLabel || p.category) === projectFilter;
  });

  // Render Moderator / Admin Dashboard when accessing /mod
  if (currentPath === '/mod' || currentPath === '/mod/') {
    return <ModDashboard onNavigateHome={() => navigateTo('/')} />;
  }

  // Render Dynamic App Detail Page when accessing /app/:id
  if (currentPath.startsWith('/app/') || currentPath === '/app') {
    const rawId = currentPath.replace(/^\/app\/?/, '').split('/')[0].split('?')[0];
    return (
      <AppDetailView
        appId={rawId}
        availableApps={availableApps}
        projects={projects}
        onNavigateHome={() => navigateTo('/')}
        onNavigateApp={(id) => navigateTo(`/app/${id}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 font-sans bg-tech-grid relative overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Ambient Lighting Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-150px] left-[15%] w-[600px] h-[500px] bg-cyan-950/20 blur-[150px] rounded-full" />
        <div className="absolute top-[40%] -right-24 w-[500px] h-[500px] bg-emerald-950/15 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-100px] left-[10%] w-[500px] h-[500px] bg-purple-950/15 blur-[160px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#06070a]/90 border-b border-zinc-900/80 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between w-full">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/');
              }} 
              className="flex items-center space-x-2.5 sm:space-x-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0c0e17] border border-zinc-800/90 group-hover:border-cyan-500/40 flex items-center justify-center p-2 shadow-inner flex-shrink-0 transition">
                <img src="/logo.svg" alt="KyrnForge Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm tracking-wider text-zinc-100 group-hover:text-cyan-300 transition">KYRNFORGE</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
                    STUDIO
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 hidden sm:block">
                  Digital Engineering &amp; Software Forge
                </div>
              </div>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-mono text-zinc-400">
            {navItems.map((item) => (
              <a 
                key={item.id}
                href={item.href} 
                target={item.isExternal ? '_blank' : '_self'}
                rel={item.isExternal ? 'noreferrer' : undefined}
                className="hover:text-cyan-400 transition flex items-center space-x-1.5"
              >
                <span>{item.label}</span>
                {item.isExternal && <ExternalLink className="w-3 h-3 text-zinc-500" />}
              </a>
            ))}
          </nav>

          {/* Header Right Actions: Status & Mobile Hamburger Toggle */}
          <div className="flex items-center space-x-2.5">
            {/* Live Edge Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold tracking-wide">kyrnforge.dev</span>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
              className="md:hidden p-2 rounded-lg bg-[#0c0e17] border border-zinc-800 text-zinc-300 hover:text-cyan-400 hover:border-zinc-700 transition active:scale-95 flex items-center justify-center shadow-sm"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-800/80 bg-[#07090e]/95 backdrop-blur-2xl px-5 py-4 space-y-3 font-mono text-xs shadow-2xl">
            <div className="flex flex-col space-y-1.5">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  target={item.isExternal ? '_blank' : '_self'}
                  rel={item.isExternal ? 'noreferrer' : undefined}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#0b0e17] border border-zinc-800/80 text-zinc-300 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-950/30 transition active:scale-[0.99]"
                >
                  <span className="font-bold tracking-wider">{item.label}</span>
                  {item.isExternal ? (
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-900/90 flex items-center justify-between text-[11px] text-zinc-500">
              <span>CLOUD EDGE ROUTING</span>
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>kyrnforge.dev</span>
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo('/mod');
                }}
                className="w-full py-2 px-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-cyan-400 text-xs font-mono transition flex items-center justify-center space-x-2"
              >
                <Key className="w-3.5 h-3.5 text-zinc-500" />
                <span>PANEL MOD / ADMIN (/mod)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-20 sm:space-y-32">

        {/* Hero Section */}
        <section className="space-y-6 pt-2 sm:pt-4 text-center sm:text-left max-w-3xl overflow-hidden">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[#0d0f18] border border-zinc-800 text-cyan-400 text-[10px] sm:text-xs font-mono max-w-full overflow-hidden">
            <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate block">{siteSettings.hero?.tagline || 'ECOSISTEMA DE SOFTWARE & HERRAMIENTAS DE ESCRITORIO'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.15] break-words">
            {siteSettings.hero?.title || 'Herramientas de escritorio nativas, utilidades de desarrollo y alto rendimiento.'}
          </h1>

          <p className="text-zinc-400 text-sm sm:text-lg leading-relaxed max-w-2xl font-normal">
            {siteSettings.hero?.description || 'Ecosistema independiente de aplicaciones y herramientas de escritorio de alto rendimiento. Software rápido, ligero y enfocado en resolver necesidades reales: diagnóstico de red y puertos, empaquetado y entornos locales de ejecución.'}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 justify-center sm:justify-start">
            <a 
              href="#descargas"
              className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono transition shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{siteSettings.hero?.buttonAppsText || 'APPS DISPONIBLES'}</span>
            </a>

            <a 
              href="#proyectos"
              className="px-6 py-3 rounded-lg bg-[#0d0f18] hover:bg-[#141724] text-zinc-300 border border-zinc-800 font-mono text-xs transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{siteSettings.hero?.buttonProjectsText || 'CATÁLOGO DE HERRAMIENTAS'}</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pt-6 border-t border-zinc-900/90 font-mono text-xs text-left">
            {(siteSettings.metrics || []).map((m, idx) => (
              <div key={idx} className="p-2.5 sm:p-3 rounded-lg bg-[#0b0d14] border border-zinc-900 overflow-hidden">
                <div className="text-zinc-500 text-[9px] sm:text-[10px] truncate">{m.label}</div>
                <div className={`${m.color || 'text-zinc-200'} font-bold mt-0.5 text-xs sm:text-sm truncate`}>{m.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Software & Apps Disponibles para Descarga (Carousel) */}
        <section id="descargas" className="space-y-6 scroll-mt-24 relative">
          <div id="kpm" className="absolute -top-24 pointer-events-none" />

          {/* Section Header with Carousel Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-900 pb-4 gap-3 sm:gap-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 tracking-wider flex items-center space-x-1.5">
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>SOFTWARE LISTO PARA DESCARGAR</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-1">
                Aplicaciones Disponibles
              </h2>
            </div>

            {/* Carousel Navigation Toolbar */}
            {availableApps.length > 0 && (
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3">
                <div className="text-xs font-mono text-zinc-400 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-zinc-200 font-bold">{availableApps[currentAppIndex]?.tag || `0${currentAppIndex + 1}`}</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-500">0{availableApps.length}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={prevApp}
                    aria-label="Aplicación anterior"
                    title="Anterior aplicación (Flecha Izquierda)"
                    className="p-2 rounded-lg bg-[#0c0e17] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextApp}
                    aria-label="Siguiente aplicación"
                    title="Siguiente aplicación (Flecha Derecha)"
                    className="p-2 rounded-lg bg-[#0c0e17] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Carousel Card Container with Smooth Sliding Track */}
          {availableApps.length > 0 ? (
            <div 
              className={`bg-[#0a0c12] border border-zinc-800 rounded-2xl relative overflow-hidden transition-all duration-500 ${availableApps[currentAppIndex]?.glowClass || ''}`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Horizontal Sliding Track */}
              <div className="overflow-hidden w-full">
                <div 
                  className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{ transform: `translateX(-${currentAppIndex * 100}%)` }}
                >
                  {availableApps.map((app) => (
                    <div 
                      key={app.id}
                      className="w-full flex-shrink-0 p-5 sm:p-8 space-y-6"
                    >
                      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-center justify-between">
                        <div className="space-y-4 max-w-2xl">
                          <div className="flex items-center space-x-3.5">
                            <a
                              href={`/app/${app.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                navigateTo(`/app/${app.id}`);
                              }}
                              className={`w-14 h-14 rounded-2xl bg-[#0c0e17] border ${app.themeBorder || 'border-zinc-800'} overflow-hidden flex items-center justify-center shadow-lg flex-shrink-0 hover:scale-105 transition-transform`}
                            >
                              <img 
                                src={app.iconImg || '/projects/default-app.svg'} 
                                alt={app.title} 
                                className={`w-full h-full object-cover ${app.iconScale || ''}`}
                                onError={(e) => {
                                  e.currentTarget.src = "/projects/default-app.svg";
                                }}
                              />
                            </a>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <a
                                  href={`/app/${app.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigateTo(`/app/${app.id}`);
                                  }}
                                  className="text-xl font-bold text-zinc-100 hover:text-cyan-300 transition"
                                >
                                  {app.title}
                                </a>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${app.badgeColor || 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'}`}>
                                  {app.badge || 'Oficial'}
                                </span>
                              </div>
                              <p className="text-xs font-mono text-zinc-400 mt-0.5">{app.system}</p>
                            </div>
                          </div>

                          <p className="text-zinc-300 text-sm leading-relaxed">
                            {app.description}
                          </p>

                          {/* Feature Tags */}
                          <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                            {app.features && app.features.map((feat, idx) => {
                              const FeatIcon = (feat.iconName && ICON_MAP[feat.iconName]) || Zap;
                              const label = typeof feat === 'object' ? feat.label : feat;
                              return (
                                <div 
                                  key={idx}
                                  className="px-3 py-1.5 rounded-md bg-[#10131e] border border-zinc-800 text-zinc-300 flex items-center space-x-2"
                                >
                                  <FeatIcon className={`w-3.5 h-3.5 ${feat.color || 'text-cyan-400'}`} />
                                  <span>{label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action Box with Semantic Crawlable Subpage Links */}
                        <div className="flex flex-col gap-3 w-full lg:w-72 lg:min-w-[260px] flex-shrink-0 bg-[#07080d] p-4 sm:p-5 rounded-xl border border-zinc-800/80">
                          <div className="text-xs font-mono text-zinc-400 text-center pb-1 flex items-center justify-center space-x-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Descarga oficial verificada</span>
                          </div>

                          <a
                            href={app.downloadUrl}
                            target={app.downloadUrl && app.downloadUrl.startsWith('http') ? '_blank' : '_self'}
                            rel="noreferrer"
                            className={`px-5 py-3 rounded-lg ${app.btnBg || 'bg-cyan-500 text-zinc-950'} font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg active:scale-95 text-center`}
                          >
                            <Download className="w-4 h-4" />
                            <span>{app.downloadLabel || 'DESCARGAR SETUP'}</span>
                          </a>

                          <button
                            onClick={() => copyDownloadUrl(app.id, app.downloadUrl)}
                            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-mono transition flex items-center justify-center space-x-2 active:scale-95"
                          >
                            {copiedAppId === app.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                            <span>{copiedAppId === app.id ? '¡ENLACE COPIADO!' : 'COPIAR ENLACE'}</span>
                          </button>

                          {/* Semantic Crawlable Anchor Tag for Googlebot and Users */}
                          <a
                            href={`/app/${app.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigateTo(`/app/${app.id}`);
                            }}
                            className="px-4 py-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono transition flex items-center justify-center space-x-1.5 active:scale-95"
                          >
                            <span>Ficha Oficial &amp; Detalles</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>

                          {app.repoUrl && (
                            <a
                              href={app.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono transition flex items-center justify-center space-x-1.5"
                            >
                              <span>Ver repositorio en GitHub</span>
                              <ExternalLink className="w-3 h-3 text-zinc-500" />
                            </a>
                          )}

                          <div className="text-[10px] font-mono text-zinc-500 text-center pt-1 border-t border-zinc-900">
                            {app.metaInfo || 'Instalador verificado y firmado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Fast Selector Tabs & Dots */}
              <div className="mx-4 sm:mx-8 py-4 border-t border-zinc-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 mr-1 hidden sm:inline">EXPLORAR APPS:</span>
                  {availableApps.map((app, idx) => (
                    <button
                      key={app.id}
                      onClick={() => setCurrentAppIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition flex items-center space-x-2 ${
                        currentAppIndex === idx
                          ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
                          : 'bg-[#090b10] text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${currentAppIndex === idx ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
                      <span>{app.tag || `0${idx + 1}`} · {app.shortName || app.title}</span>
                    </button>
                  ))}
                </div>

                {/* Bullet progress indicators */}
                <div className="flex items-center space-x-2">
                  {availableApps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentAppIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        currentAppIndex === idx ? 'w-7 bg-cyan-400' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                      }`}
                      aria-label={`Ir a la aplicación ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0a0c12] border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
              <p className="text-xs font-mono text-zinc-400">Sincronizando aplicaciones desde Cloudflare KV...</p>
            </div>
          )}
        </section>

        {/* All Projects & Pipeline Grid */}
        <section id="proyectos" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-900 pb-4 gap-4">
            <div>
              <div className="text-xs font-mono text-amber-400 tracking-wider">ECOSISTEMA KYRNFORGE</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-1">
                Catálogo de Software &amp; Herramientas
              </h2>
            </div>

            {/* Filter Tabs (Derivado dinámicamente sin categorías vacías) */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#0a0c12] border border-zinc-900 font-mono text-xs">
              {categoryFilters.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProjectFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-md transition ${projectFilter === tab.id ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredProjects.map((p) => (
                <div 
                  key={p.id}
                  className="bg-[#090b10] border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 sm:p-6 space-y-4 transition duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
                      <div className="flex items-center space-x-3.5">
                        <a
                          href={`/app/${p.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateTo(`/app/${p.id}`);
                          }}
                          className="w-12 h-12 rounded-xl bg-[#0c0e17] border border-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-zinc-700 transition"
                        >
                          <img 
                            src={p.iconImg || "/projects/default-app.svg"} 
                            alt={p.title} 
                            className={`w-full h-full object-cover ${p.id === 'kpm' ? 'scale-[1.12]' : ''}`}
                            onError={(e) => {
                              e.currentTarget.src = "/projects/default-app.svg";
                            }}
                          />
                        </a>
                        <div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={`/app/${p.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                navigateTo(`/app/${p.id}`);
                              }}
                              className="text-base font-bold text-zinc-100 hover:text-cyan-300 transition"
                            >
                              {p.title}
                            </a>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">{p.categoryLabel || p.category}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border self-start sm:self-auto whitespace-nowrap ${p.badgeColor || 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'}`}>
                        {p.statusLabel || 'Oficial'}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                      {p.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-zinc-900/80">
                    <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                      {p.tags && p.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {typeof t === 'object' ? (t.label || t.name || '') : t}
                        </span>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      {/* Semantic Crawlable Anchor Tag for Googlebot and Users */}
                      <a 
                        href={`/app/${p.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo(`/app/${p.id}`);
                        }}
                        className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition group/link"
                      >
                        <span>Ver Ficha Oficial</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </a>

                      {p.repoUrl && (
                        <a 
                          href={p.repoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition"
                        >
                          <span>GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0a0c12] border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
              <p className="text-xs font-mono text-zinc-400">Sincronizando catálogo de proyectos desde Cloudflare KV...</p>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 mt-20 sm:mt-32 py-10 sm:py-12 text-xs font-mono text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-300">KYRNFORGE</span>
            <span>·</span>
            <span>Digital Engineering &amp; Software Forge</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6">
            <a href="https://github.com/devlwte/kyrn-devdock/blob/main/LICENSE" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition">
              Licencia Oficial
            </a>
            <a href="https://github.com/devlwte" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition">
              GitHub (@devlwte)
            </a>
            <button
              onClick={() => navigateTo('/mod')}
              className="hover:text-cyan-400 text-zinc-600 transition flex items-center space-x-1"
              title="Panel de Gestión &amp; Mod (/mod)"
            >
              <Key className="w-3 h-3" />
              <span>/MOD</span>
            </button>
            <span className="text-zinc-600">2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
