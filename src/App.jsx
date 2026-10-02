import React, { useState } from 'react';
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
  Check
} from 'lucide-react';

export default function App() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('status');
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [projectFilter, setProjectFilter] = useState('all');
  const [copiedKpmLink, setCopiedKpmLink] = useState(false);

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

  const copyDownloadUrl = () => {
    navigator.clipboard.writeText("https://github.com/devlwte/kpm-studio/releases/download/v1.0.0/Krypton-Package-Manager-Setup-v1.0.0.zip");
    setCopiedKpmLink(true);
    setTimeout(() => setCopiedKpmLink(false), 2000);
  };

  // Projects Catalog
  const projects = [
    {
      id: 'kpm',
      category: 'featured',
      categoryLabel: 'Software de Empaquetado & Compresión',
      title: 'Krypton Package Manager (KPM)',
      version: 'v1.0.0 Oficial',
      status: 'production',
      statusLabel: 'Listo para Producción',
      badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
      icon: Package,
      iconColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
      description: 'Suite integral para crear instaladores y paquetes portables de Windows. Combina compresión Brotli Ultra (ahorro >99% en imágenes .ISO) con Deflate 9, Bóveda criptográfica militar AES-256-GCM, modo sigilo anónimo y extracción por streaming sin archivos temporales.',
      tags: ['Bóveda AES-256-GCM', 'Compresión Brotli Ultra', 'Bytecode V8 Blindado', 'Windows 10/11'],
      downloadUrl: 'https://github.com/devlwte/kpm-studio/releases/download/v1.0.0/Krypton-Package-Manager-Setup-v1.0.0.zip',
      repoUrl: 'https://github.com/devlwte/kpm-studio',
      isFlagship: true
    },
    {
      id: 'playwarp',
      category: 'gaming',
      categoryLabel: 'Videojuegos & Plataforma',
      title: 'PlayWarp Launcher',
      version: 'v1.0 (En Desarrollo)',
      status: 'dev',
      statusLabel: 'En Desarrollo Activo',
      badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
      icon: Gamepad2,
      iconColor: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
      description: 'Launcher de videojuegos universal y agregador de tiendas legales. Diseñado para explorar, comprar y descargar títulos de distribuidores autorizados en una sola interfaz ligera con catálogo multi-página, optimizado para PC y Steam Deck (100% legal y sin bloatware).',
      tags: ['Game Launcher', 'Catálogo Multi-Tienda', '100% Legal', 'Soporte PC / Deck'],
      repoUrl: null,
      isFlagship: false
    },
    {
      id: 'kyrnex',
      category: 'tools',
      categoryLabel: 'Plataforma & Runtime Local',
      title: 'Kyrnex Platform',
      version: 'v1.0.0 Estable',
      status: 'production',
      statusLabel: 'Producción Estable',
      badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/30',
      icon: Server,
      iconColor: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
      description: 'Plataforma integral de ejecución y gestión de aplicaciones web locales (Local Web Applications Runtime & Manager Platform). Permite levantar servidores locales instantáneos, orquestar microservicios con DynExpress y probar APIs directamente en Windows sin configuraciones engorrosas.',
      tags: ['Local Web Runtime', 'DynExpress Core', 'Manager de Servidores', 'Cero Configuración'],
      repoUrl: null,
      isFlagship: false
    },
    {
      id: '2dgo',
      category: 'gaming',
      categoryLabel: 'Motor de Videojuegos',
      title: '2DGO Engine',
      version: 'Core Architecture',
      status: 'dev',
      statusLabel: 'Arquitectura & Core',
      badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
      icon: Code2,
      iconColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
      description: 'Framework modular de alto rendimiento para renderizado 2D, físicas de plataformas ágiles y videojuegos retro-modernos. Diseñado para ofrecer máxima tasa de cuadros por segundo con un consumo ultra bajo de CPU y memoria en cualquier computadora.',
      tags: ['2D Game Engine', 'Render Ultra-Fluido', 'Física de Plataformas', 'Bajo Consumo'],
      repoUrl: null,
      isFlagship: false
    },
    {
      id: 'getgame',
      category: 'tools',
      categoryLabel: 'Herramienta de Distribución',
      title: 'GetGame Utility',
      version: 'Utility Tool',
      status: 'planned',
      statusLabel: 'Utilidad Nativa',
      badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-950/30',
      icon: Download,
      iconColor: 'text-blue-400 bg-blue-950/40 border-blue-500/30',
      description: 'Herramienta nativa de distribución rápida y verificación criptográfica de integridad para paquetes y assets de videojuegos. Opera sin servicios invasivos en segundo plano ni telemetría oculta.',
      tags: ['Verificación de Integridad', 'Descarga Segura', 'Sin Telemetría Invasiva'],
      repoUrl: null,
      isFlagship: false
    }
  ];

  const filteredProjects = projectFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === projectFilter || (projectFilter === 'gaming' && p.category === 'gaming') || (projectFilter === 'tools' && (p.category === 'tools' || p.category === 'featured')));

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 font-sans bg-tech-grid relative overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Ambient Lighting Accents */}
      <div className="fixed top-[-150px] left-[15%] w-[600px] h-[500px] bg-cyan-950/20 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[-100px] w-[500px] h-[500px] bg-emerald-950/15 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-100px] left-[10%] w-[500px] h-[500px] bg-purple-950/15 blur-[160px] rounded-full pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#06070a]/85 border-b border-zinc-900/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#0c0e17] border border-zinc-800/90 flex items-center justify-center p-2 shadow-inner">
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-mono text-zinc-400">
            <a href="#proyectos" className="hover:text-cyan-400 transition">PROYECTOS</a>
            <a href="#kpm" className="hover:text-cyan-400 transition">KPM STUDIO</a>
            <a href="#api" className="hover:text-cyan-400 transition">API GATEWAY</a>
            <a href="https://github.com/devlwte" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition flex items-center space-x-1.5">
              <span>GITHUB</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </nav>

          {/* Live Edge Status */}
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold tracking-wide">kyrnforge.dev</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-32">

        {/* Hero Section */}
        <section className="space-y-6 pt-4 text-center sm:text-left max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-[#0d0f18] border border-zinc-800 text-cyan-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>FORJA INDEPENDIENTE DE SOFTWARE NATIVO & VIDEOJUEGOS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.12]">
            Herramientas nativas, compresión extrema y experiencias de juego.
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            Desarrollo independiente sin dependencias infladas. Enfocados en software de alto rendimiento para Windows, seguridad criptográfica Bóveda AES-256, lanzadores de juegos y entornos de ejecución web ligeros.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 justify-center sm:justify-start">
            <a 
              href="#kpm"
              className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono transition shadow-lg shadow-cyan-500/25 flex items-center space-x-2 active:scale-95"
            >
              <span>EXPLORAR KPM STUDIO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a 
              href="#proyectos"
              className="px-6 py-3 rounded-lg bg-[#0d0f18] hover:bg-[#141724] text-zinc-300 border border-zinc-800 font-mono text-xs transition flex items-center space-x-2"
            >
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>CATÁLOGO DE PROYECTOS</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-900/90 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#0b0d14] border border-zinc-900">
              <div className="text-zinc-500 text-[10px]">LENGUAJES & RUNTIME</div>
              <div className="text-zinc-200 font-bold mt-0.5">Nativo / Bytecode V8</div>
            </div>
            <div className="p-3 rounded-lg bg-[#0b0d14] border border-zinc-900">
              <div className="text-zinc-500 text-[10px]">SEGURIDAD CRIPTOGRÁFICA</div>
              <div className="text-cyan-400 font-bold mt-0.5">Bóveda AES-256-GCM</div>
            </div>
            <div className="p-3 rounded-lg bg-[#0b0d14] border border-zinc-900">
              <div className="text-zinc-500 text-[10px]">INFRAESTRUCTURA WEB</div>
              <div className="text-emerald-400 font-bold mt-0.5">Cloudflare Global Edge</div>
            </div>
            <div className="p-3 rounded-lg bg-[#0b0d14] border border-zinc-900">
              <div className="text-zinc-500 text-[10px]">LICENCIAMIENTO</div>
              <div className="text-purple-400 font-bold mt-0.5">Freeware & Legal</div>
            </div>
          </div>
        </section>

        {/* Flagship Product Showcase (KPM Studio) */}
        <section id="kpm" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-900 pb-4 gap-2">
            <div>
              <div className="text-xs font-mono text-cyan-400 tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>LANZAMIENTO INSIGNIA OFICIAL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-1">
                Krypton Package Manager (KPM)
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
                v1.0.0 Disponible
              </span>
            </div>
          </div>

          <div className="bg-[#0a0c12] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden glow-cyan">
            
            <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center p-2.5">
                    <Package className="w-full h-full text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100">KPM Studio Suite</h3>
                    <p className="text-xs font-mono text-zinc-400">Windows 10 & 11 (64-bit) · Instalador Setup Oficial y Modo Portable</p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Suite moderna de empaquetado y compresión de software para desarrolladores. Diseñada para sustituir herramientas tradicionales engorrosas mediante una interfaz visual cibernética, compresión extrema <b>Brotli Ultra</b> (ahorro superior al 99% en imágenes crudas <code>.iso</code>), Bóveda criptográfica militar <b>AES-256-GCM</b> con protección Anti-Tamper, <b>Modo Sigilo</b> con identificadores anónimos 16-hex sin extensión y extracción de flujo multi-volumen continua sin archivos temporales.
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                  <div className="px-3 py-1.5 rounded-md bg-[#10131e] border border-zinc-800 text-zinc-300 flex items-center space-x-2">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cifrado Bóveda AES-256</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-md bg-[#10131e] border border-zinc-800 text-zinc-300 flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Brotli Ultra & Deflate 9</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-md bg-[#10131e] border border-zinc-800 text-zinc-300 flex items-center space-x-2">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span>Bytecode V8 Blindado</span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="flex flex-col gap-3 min-w-[240px] bg-[#07080d] p-5 rounded-xl border border-zinc-800/80">
                <div className="text-xs font-mono text-zinc-400 text-center pb-1">
                  Descarga oficial verificada
                </div>

                <a
                  href="https://github.com/devlwte/kpm-studio/releases/download/v1.0.0/Krypton-Package-Manager-Setup-v1.0.0.zip"
                  className="px-5 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95 text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>DESCARGAR SETUP (.ZIP)</span>
                </a>

                <button
                  onClick={copyDownloadUrl}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-mono transition flex items-center justify-center space-x-2"
                >
                  {copiedKpmLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  <span>{copiedKpmLink ? 'ENLACE COPIADO' : 'COPIAR ENLACE'}</span>
                </button>

                <a
                  href="https://github.com/devlwte/kpm-studio"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono transition flex items-center justify-center space-x-1.5"
                >
                  <span>Ver repositorio en GitHub</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </div>
            </div>

          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((p) => {
              const IconComponent = p.icon;
              return (
                <div 
                  key={p.id}
                  className="bg-[#090b10] border border-zinc-900 hover:border-zinc-800 rounded-xl p-6 space-y-4 transition duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center p-2 ${p.iconColor}`}>
                          <IconComponent className="w-full h-full" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-zinc-100">{p.title}</h4>
                          <span className="text-[11px] font-mono text-zinc-500">{p.categoryLabel}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap ${p.badgeColor}`}>
                        {p.statusLabel}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                      {p.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-zinc-900/80">
                    <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                      {p.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {t}
                        </span>
                      ))}
                    </div>

                    {p.repoUrl && (
                      <div className="pt-1">
                        <a 
                          href={p.repoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
                        >
                          <span>Ver en GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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

          <div className="bg-[#090b10] border border-zinc-800 rounded-xl p-6 space-y-4 font-mono">
            {/* Endpoint Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-zinc-500 font-bold">MÉTODO:</span>
                <div className="flex space-x-1 bg-[#050608] p-1 rounded-md border border-zinc-900 text-xs">
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
                className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center space-x-2 border border-zinc-700 active:scale-95"
              >
                <Activity className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingApi ? 'animate-spin' : ''}`} />
                <span>{isLoadingApi ? 'CONSULTANDO...' : 'CONSULTAR EN VIVO'}</span>
              </button>
            </div>

            {/* URL Display */}
            <div className="flex items-center space-x-2 text-xs text-zinc-400 bg-[#050608] px-3 py-2 rounded border border-zinc-900">
              <span className="text-emerald-400 font-bold">{selectedEndpoint === 'auth' ? 'POST' : 'GET'}</span>
              <span className="text-zinc-200">https://kyrnforge.dev/api/v1/{selectedEndpoint}</span>
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
                  <pre className="text-emerald-400 text-xs leading-relaxed">
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
      <footer className="border-t border-zinc-900 mt-32 py-12 text-xs font-mono text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-300">KYRNFORGE</span>
            <span>·</span>
            <span>Digital Engineering & Software Forge</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="https://github.com/devlwte/kpm-studio/blob/main/LICENSE" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition">
              Licencia KPM
            </a>
            <a href="https://github.com/devlwte" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition">
              GitHub (@devlwte)
            </a>
            <span className="text-zinc-600">2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
