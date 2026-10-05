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

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [selectedEndpoint, setSelectedEndpoint] = useState('status');
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [projectFilter, setProjectFilter] = useState('all');
  const [copiedKpmLink, setCopiedKpmLink] = useState(false);
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    return initialAvailableApps;
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
    return initialProjects;
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
    return initialSiteSettings;
  });

  // Client-side history popstate listener for /mod route
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch latest JSON data from server on startup so updates are received by all visitors
  useEffect(() => {
    const fetchRemoteData = async () => {
      try {
        const timestamp = Date.now();
        // 1. Try fetching via API (supports Cloudflare KV and dynamic Edge)
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

        // 1.5 External Database URL fallback (Firebase RTDB, Supabase, etc.)
        const customDbUrl = localStorage.getItem('kyrnforge_custom_db_url');
        if (customDbUrl) {
          try {
            const cleanUrl = customDbUrl.replace(/\/$/, '');
            const target = cleanUrl.endsWith('.json') ? cleanUrl : `${cleanUrl}/apps.json`;
            const customApps = await fetch(`${target}?t=${timestamp}`).then(r => r.ok ? r.json() : null).catch(() => null);
            if (customApps && Array.isArray(customApps) && customApps.length > 0) {
              setAvailableApps(customApps);
              localStorage.setItem('kyrnforge_available_apps', JSON.stringify(customApps));
              return;
            }
          } catch {
            // fallback to static JSON
          }
        }

        // 2. Direct static JSON fallback with cache-busting
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

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync availableApps, projects, and siteSettings when returning to public view or on external storage change
  useEffect(() => {
    if (currentPath !== '/mod' && currentPath !== '/mod/') {
      try {
        const savedApps = localStorage.getItem('kyrnforge_available_apps');
        if (savedApps) {
          const parsed = JSON.parse(savedApps);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAvailableApps(parsed);
          }
        }
        const savedProjects = localStorage.getItem('kyrnforge_projects');
        if (savedProjects) {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
          }
        }
        const savedSettings = localStorage.getItem('kyrnforge_site_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed && parsed.hero) {
            setSiteSettings(parsed);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [currentPath]);

  // Adjust carousel index if apps array shrinks
  useEffect(() => {
    if (availableApps.length > 0 && currentAppIndex >= availableApps.length) {
      setCurrentAppIndex(Math.max(0, availableApps.length - 1));
    }
  }, [availableApps.length, currentAppIndex]);

  // Centralized Navigation Links (Easily expandable for future additions)
  const navItems = [
    { id: 'proyectos', label: 'PROYECTOS', href: '#proyectos' },
    { id: 'descargas', label: 'DESCARGAS', href: '#descargas' },
    { id: 'api', label: 'API GATEWAY', href: '#api' },
    { id: 'github', label: 'GITHUB', href: 'https://github.com/devlwte', isExternal: true }
  ];

  const fetchLiveApi = async (endpoint = selectedEndpoint) => {
    setIsLoadingApi(true);
    const start = performance.now();
    try {
      let res;
      if (endpoint === 'status') {
        res = await fetch('/api/v1/status');
      } else if (endpoint === 'health') {
        res = await fetch('/api/v1/health');
      } else if (endpoint === 'auth') {
        res = await fetch('/api/v1/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: 'demo_guest_key', clientApp: 'KyrnForgeWebClient' })
        });
      }
      const data = await res.json();
      setLatencyMs(Math.round(performance.now() - start));
      setApiResponse(data);
    } catch (e) {
      setLatencyMs(Math.round(performance.now() - start));
      setApiResponse({
        status: "operational",
        service: `KyrnForge API (${endpoint.toUpperCase()})`,
        version: "1.0.0",
        gateway: "Cloudflare Edge Serverless",
        node: "LOCAL-EDGE",
        timestamp: new Date().toISOString(),
        uptime: "99.99%",
        note: "Simulación de respuesta local"
      });
    } finally {
      setIsLoadingApi(false);
    }
  };

  const [copiedAppId, setCopiedAppId] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);

  const prevApp = () => {
    setCurrentAppIndex((prev) => (prev === 0 ? availableApps.length - 1 : prev - 1));
  };

  const nextApp = () => {
    setCurrentAppIndex((prev) => (prev === availableApps.length - 1 ? 0 : prev + 1));
  };

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
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  const filteredProjects = (projects || []).filter(p => {
    if (projectFilter === 'all') return true;
    if (projectFilter === 'gaming') return p.category === 'gaming';
    if (projectFilter === 'tools') return p.category === 'tools' || p.category === 'featured';
    return p.category === projectFilter;
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
            <div className="w-9 h-9 rounded-xl bg-[#0c0e17] border border-zinc-800/90 flex items-center justify-center p-2 shadow-inner flex-shrink-0">
              <img src="/logo.svg" alt="KyrnForge Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm tracking-wider text-zinc-100">KYRNFORGE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
                  STUDIO
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 hidden sm:block">
                Digital Engineering & Software Forge
              </div>
            </div>
          </div>

          {/* Desktop Nav (Dynamic from navItems, easy to expand in the future) */}
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
          <div className="md:hidden border-b border-zinc-800/80 bg-[#07090e]/95 backdrop-blur-2xl px-5 py-4 space-y-3 font-mono text-xs animate-fadeIn shadow-2xl">
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
            <span className="truncate block">{siteSettings.hero?.tagline || 'FORJA INDEPENDIENTE DE SOFTWARE NATIVO & VIDEOJUEGOS'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.15] break-words">
            {siteSettings.hero?.title || 'Herramientas nativas, compresión extrema y experiencias de juego.'}
          </h1>

          <p className="text-zinc-400 text-sm sm:text-lg leading-relaxed max-w-2xl font-normal">
            {siteSettings.hero?.description || 'Desarrollo independiente sin dependencias infladas. Enfocados en software de alto rendimiento para Windows, seguridad criptográfica Bóveda AES-256, lanzadores de juegos y entornos de ejecución web ligeros.'}
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
              className="px-6 py-3 rounded-lg bg-[#0d0f18] hover:bg-[#141724] text-zinc-300 border border-zinc-800 font-mono text-xs transition flex items-center justify-center space-x-2"
            >
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>{siteSettings.hero?.buttonProjectsText || 'CATÁLOGO DE PROYECTOS'}</span>
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

        {/* Software & Apps Disponibles para Descarga (Carousel de un solo item) */}
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
                  <span className="text-zinc-200 font-bold">{availableApps[currentAppIndex]?.tag}</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-500">0{availableApps.length}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={prevApp}
                    aria-label="Aplicación anterior"
                    title="Anterior aplicación"
                    className="p-2 rounded-lg bg-[#0c0e17] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextApp}
                    aria-label="Siguiente aplicación"
                    title="Siguiente aplicación"
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
                          <div className={`w-14 h-14 rounded-2xl bg-[#0c0e17] border ${app.themeBorder} overflow-hidden flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <img 
                              src={app.iconImg} 
                              alt={app.title} 
                              className={`w-full h-full object-cover ${app.iconScale}`}
                              onError={(e) => {
                                e.currentTarget.src = "/projects/default-app.svg";
                              }}
                            />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-bold text-zinc-100">{app.title}</h3>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${app.badgeColor}`}>
                                {app.badge}
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
                            const FeatIcon = feat.icon || (feat.iconName && ICON_MAP[feat.iconName]) || Zap;
                            return (
                              <div 
                                key={idx}
                                className="px-3 py-1.5 rounded-md bg-[#10131e] border border-zinc-800 text-zinc-300 flex items-center space-x-2"
                              >
                                <FeatIcon className={`w-3.5 h-3.5 ${feat.color || 'text-cyan-400'}`} />
                                <span>{feat.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Box */}
                      <div className="flex flex-col gap-3 w-full lg:w-72 lg:min-w-[260px] flex-shrink-0 bg-[#07080d] p-4 sm:p-5 rounded-xl border border-zinc-800/80">
                        <div className="text-xs font-mono text-zinc-400 text-center pb-1 flex items-center justify-center space-x-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Descarga oficial verificada</span>
                        </div>

                        <a
                          href={app.downloadUrl}
                          target={app.downloadUrl.startsWith('http') ? '_blank' : '_self'}
                          rel="noreferrer"
                          className={`px-5 py-3 rounded-lg ${app.btnBg} font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg active:scale-95 text-center`}
                        >
                          <Download className="w-4 h-4" />
                          <span>{app.downloadLabel}</span>
                        </a>

                        <button
                          onClick={() => copyDownloadUrl(app.id, app.downloadUrl)}
                          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-mono transition flex items-center justify-center space-x-2 active:scale-95"
                        >
                          {copiedAppId === app.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                          <span>{copiedAppId === app.id ? 'ENLACE COPIADO' : 'COPIAR ENLACE'}</span>
                        </button>

                        <button
                          onClick={() => navigateTo(`/app/${app.id}`)}
                          className="px-4 py-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono transition flex items-center justify-center space-x-1.5 active:scale-95"
                        >
                          <span>Ficha Oficial &amp; Detalles</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={app.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono transition flex items-center justify-center space-x-1.5"
                        >
                          <span>Ver repositorio en GitHub</span>
                          <ExternalLink className="w-3 h-3 text-zinc-500" />
                        </a>

                        <div className="text-[10px] font-mono text-zinc-500 text-center pt-1 border-t border-zinc-900">
                          {app.metaInfo}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Fast Selector Tabs & Dots (Anchored at the bottom) */}
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
                    <span>{app.tag} · {app.shortName}</span>
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
                    aria-label={`Ir al elemento ${idx + 1}`}
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
                Línea de Proyectos & Videojuegos
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#0a0c12] border border-zinc-900 font-mono text-xs">
              <button
                onClick={() => setProjectFilter('all')}
                className={`px-3 py-1.5 rounded-md transition ${projectFilter === 'all' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Todos ({projects.length})
              </button>
              <button
                onClick={() => setProjectFilter('gaming')}
                className={`px-3 py-1.5 rounded-md transition ${projectFilter === 'gaming' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Gaming ({projects.filter(p => p.category === 'gaming').length})
              </button>
              <button
                onClick={() => setProjectFilter('tools')}
                className={`px-3 py-1.5 rounded-md transition ${projectFilter === 'tools' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Herramientas & Web
              </button>
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((p) => {
              const IconComponent = p.icon;
              return (
                <div 
                  key={p.id}
                  className="bg-[#090b10] border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 sm:p-6 space-y-4 transition duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#0c0e17] border border-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm relative group-hover:border-zinc-700 transition">
                          {p.iconImg ? (
                            <img 
                              src={p.iconImg} 
                              alt={p.title} 
                              className={`w-full h-full object-cover ${p.id === 'kpm' ? 'scale-[1.12]' : ''} ${p.id === '2dgo' ? '[image-rendering:pixelated]' : ''}`}
                              onError={(e) => {
                                e.currentTarget.src = "/projects/default-app.svg";
                              }}
                            />
                          ) : (
                            <img 
                              src="/projects/default-app.svg" 
                              alt="Default App Icon" 
                              className="w-full h-full object-cover opacity-85" 
                              title="Icono por defecto (en diseño)"
                            />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base font-bold text-zinc-100">{p.title}</h4>
                            {!p.iconImg && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50" title="Este proyecto usa el icono por defecto">
                                Icono base
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">{p.categoryLabel}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border self-start sm:self-auto whitespace-nowrap ${p.badgeColor}`}>
                        {p.statusLabel}
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
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <button 
                        onClick={() => navigateTo(`/app/${p.id}`)}
                        className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition group"
                      >
                        <span>Ver Ficha Oficial</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>

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
              );
            })}
            </div>
          ) : (
            <div className="bg-[#0a0c12] border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
              <p className="text-xs font-mono text-zinc-400">Sincronizando catálogo de proyectos desde Cloudflare KV...</p>
            </div>
          )}
        </section>

        {/* Live Interactive API Gateway Console */}
        <section id="api" className="space-y-6 scroll-mt-24">
          <div className="border-b border-zinc-900 pb-4">
            <div className="text-xs font-mono text-cyan-400 tracking-wider">GATEWAY SERVERLESS</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-1">Consola de API en Tiempo Real</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Prueba los endpoints serverless de Cloudflare que alimentan las verificaciones de estado y autenticación de nuestras herramientas.
            </p>
          </div>

          <div className="bg-[#090b10] border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4 font-mono">
            {/* Endpoint Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
              <div className="flex items-center space-x-2 overflow-x-auto max-w-full">
                <span className="text-xs text-zinc-500 font-bold flex-shrink-0">MÉTODO:</span>
                <div className="flex space-x-1 bg-[#050608] p-1 rounded-md border border-zinc-900 text-xs flex-shrink-0">
                  <button
                    onClick={() => { setSelectedEndpoint('status'); fetchLiveApi('status'); }}
                    className={`px-2.5 py-1 rounded transition ${selectedEndpoint === 'status' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    GET /status
                  </button>
                  <button
                    onClick={() => { setSelectedEndpoint('health'); fetchLiveApi('health'); }}
                    className={`px-2.5 py-1 rounded transition ${selectedEndpoint === 'health' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    GET /health
                  </button>
                  <button
                    onClick={() => { setSelectedEndpoint('auth'); fetchLiveApi('auth'); }}
                    className={`px-2.5 py-1 rounded transition ${selectedEndpoint === 'auth' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    POST /auth
                  </button>
                </div>
              </div>

              <button
                onClick={() => fetchLiveApi(selectedEndpoint)}
                disabled={isLoadingApi}
                className="w-full sm:w-auto justify-center px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center space-x-2 border border-zinc-700 active:scale-95"
              >
                <Activity className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingApi ? 'animate-spin' : ''}`} />
                <span>{isLoadingApi ? 'CONSULTANDO...' : 'CONSULTAR EN VIVO'}</span>
              </button>
            </div>

            {/* URL Display */}
            <div className="flex items-center space-x-2 text-xs text-zinc-400 bg-[#050608] px-3 py-2 rounded border border-zinc-900 overflow-x-auto max-w-full">
              <span className="text-emerald-400 font-bold flex-shrink-0">{selectedEndpoint === 'auth' ? 'POST' : 'GET'}</span>
              <span className="text-zinc-200 truncate">https://kyrnforge.dev/api/v1/{selectedEndpoint}</span>
            </div>

            {/* Terminal Window */}
            <div className="bg-[#030406] border border-zinc-900 rounded-lg p-4 text-xs overflow-x-auto min-h-[160px] flex flex-col justify-between">
              {apiResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-900/80 pb-1.5">
                    <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>HTTP 200 OK</span>
                    </span>
                    {latencyMs && <span className="text-cyan-400">Latencia Edge: {latencyMs} ms</span>}
                  </div>
                  <pre className="text-emerald-400 text-xs leading-relaxed overflow-x-auto">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-zinc-600 flex flex-col items-center justify-center py-8 space-y-1.5 text-center">
                  <Terminal className="w-6 h-6 text-zinc-700" />
                  <span>Haz clic en "CONSULTAR EN VIVO" para realizar una petición real a la infraestructura de Cloudflare.</span>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 mt-20 sm:mt-32 py-10 sm:py-12 text-xs font-mono text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-300">KYRNFORGE</span>
            <span>·</span>
            <span>Digital Engineering & Software Forge</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6">
            <a href="https://github.com/devlwte/kpm-studio/blob/main/LICENSE" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition">
              Licencia KPM
            </a>
            <a href="https://github.com/devlwte" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition">
              GitHub (@devlwte)
            </a>
            <button
              onClick={() => navigateTo('/mod')}
              className="hover:text-cyan-400 text-zinc-600 transition flex items-center space-x-1"
              title="Panel de Gestión & Mod (/mod)"
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
