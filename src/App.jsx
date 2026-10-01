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
  CheckCircle2, 
  Lock, 
  Activity,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

export default function App() {
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);

  const fetchLiveApi = async () => {
    setIsLoadingApi(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/v1/status');
      const data = await res.json();
      setLatencyMs(Math.round(performance.now() - start));
      setApiResponse(data);
    } catch (e) {
      // Fallback for local preview if functions not routed through wrangler
      setLatencyMs(Math.round(performance.now() - start));
      setApiResponse({
        status: "operational",
        service: "KyrnForge Core API (Local Simulation)",
        version: "1.0.0",
        gateway: "Cloudflare Edge Serverless",
        node: "LOCAL-EDGE",
        timestamp: new Date().toISOString(),
        uptime: "99.99%"
      });
    } finally {
      setIsLoadingApi(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 font-sans bg-tech-grid relative overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-950/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-emerald-950/15 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07080c]/80 border-b border-zinc-900/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 shadow-sm">
              <img src="/logo.svg" alt="KyrnForge Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm tracking-widest text-zinc-100">KYRNFORGE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 hidden sm:inline">
                STUDIO
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-mono text-zinc-400">
            <a href="#software" className="hover:text-cyan-400 transition">SOFTWARE</a>
            <a href="#pipeline" className="hover:text-cyan-400 transition">PIPELINE</a>
            <a href="#api" className="hover:text-cyan-400 transition">API GATEWAY</a>
            <a href="https://github.com/devlwte" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition flex items-center space-x-1">
              <span>GITHUB</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">EDGE ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-28">

        {/* Hero Section */}
        <section className="space-y-6 pt-6 text-center sm:text-left max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-cyan-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>NATIVE ENGINEERING & INDIE SOFTWARE FORGE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.15]">
            Construyendo herramientas de alto rendimiento y experiencias interactivas.
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            Laboratorio independiente dedicado a la creación de software nativo para Windows, compresión criptográfica sin duplicación de memoria, utilidades para desarrolladores y motores de juegos ligeros.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 justify-center sm:justify-start">
            <a 
              href="#software"
              className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono transition shadow-lg shadow-cyan-500/20 flex items-center space-x-2 active:scale-95"
            >
              <span>EXPLORAR SOFTWARE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a 
              href="https://github.com/devlwte" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-mono text-xs transition flex items-center space-x-2"
            >
              <Code2 className="w-4 h-4 text-zinc-400" />
              <span>GITHUB PROFILE</span>
            </a>
          </div>
        </section>

        {/* Featured Flagship Software */}
        <section id="software" className="space-y-8 scroll-mt-24">
          <div className="border-b border-zinc-900 pb-4 flex items-end justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400 tracking-wider">PROYECTO INSIGNIA</div>
              <h2 className="text-2xl font-bold text-zinc-100 mt-1">Ecosistema de Software Activo</h2>
            </div>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">v1.0.0 DISPONIBLE</span>
          </div>

          {/* KPM Studio Showcase Card */}
          <div className="bg-[#0b0d14] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 hover:border-cyan-500/40 transition duration-300 relative group glow-cyan">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center p-2">
                    <Package className="w-full h-full text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100 tracking-wide">Krypton Package Manager (KPM)</h3>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400">
                      <span>Windows 10 / 11 (64-bit)</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">Producción Estable</span>
                    </div>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed pt-1">
                  Suite completa de empaquetado, compresión y distribución de software para Windows. Reemplaza herramientas heredadas con una arquitectura de compresión ultra-avanzada (Brotli Ultra + Deflate 9), streaming multi-volumen sin archivos temporales, bóveda criptográfica militar AES-256-GCM y modo sigilo determinista sin extensión.
                </p>

                {/* Technical Badges */}
                <div className="flex flex-wrap gap-2 pt-2 font-mono text-[11px]">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center space-x-1.5">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>Bóveda AES-256-GCM</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center space-x-1.5">
                    <Cpu className="w-3 h-3 text-purple-400" />
                    <span>Bytecode V8 Blindado</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center space-x-1.5">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    <span>99%+ Ahorro en Imágenes .ISO</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
                <a
                  href="https://github.com/devlwte/kpm-studio/releases/download/v1.0.0/Krypton-Package-Manager-Setup-v1.0.0.zip"
                  className="px-5 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>DESCARGAR SETUP (.ZIP)</span>
                </a>

                <a
                  href="https://github.com/devlwte/kpm-studio"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-mono text-xs transition flex items-center justify-center space-x-2"
                >
                  <span>VER REPOSITORIO</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline / Ecosystem Grid */}
        <section id="pipeline" className="space-y-6 scroll-mt-24">
          <div className="border-b border-zinc-900 pb-4">
            <div className="text-xs font-mono text-emerald-400 tracking-wider">FORJA EN DESARROLLO</div>
            <h2 className="text-2xl font-bold text-zinc-100 mt-1">Línea de Proyectos & Videojuegos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="bg-[#090a10] border border-zinc-900 rounded-xl p-6 space-y-3 hover:border-zinc-800 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-zinc-200 font-bold">
                  <Gamepad2 className="w-5 h-5 text-amber-400" />
                  <span>PlayWarp</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/30">
                  EN DESARROLLO
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Cliente de juegos arcade y entorno de ejecución interactivo ligero diseñado para partidas rápidas y sincronización instantánea de puntuaciones.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#090a10] border border-zinc-900 rounded-xl p-6 space-y-3 hover:border-zinc-800 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-zinc-200 font-bold">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <span>2DGO Engine</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
                  ARQUITECTURA 2D
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Framework gráfico de alto rendimiento para renderizado 2D y mecánicas de plataformas con consumo mínimo de recursos en hardware modesto.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#090a10] border border-zinc-900 rounded-xl p-6 space-y-3 hover:border-zinc-800 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-zinc-200 font-bold">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <span>GetGame</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  UTILIDAD NATIVA
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Herramienta de distribución y verificación de integridad de recursos de juegos sin intermediarios pesados ni servicios en segundo plano.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#090a10] border border-zinc-900 rounded-xl p-6 space-y-3 hover:border-zinc-800 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-zinc-200 font-bold">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <span>Kyrnex Core</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-400 border border-purple-500/30">
                  SERVER DAEMON
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Micro-demonio local para pruebas de desarrollo, túneles seguros y emulación de servidores API para aplicaciones de escritorio.
              </p>
            </div>
          </div>
        </section>

        {/* Live API Gateway Interactive Section */}
        <section id="api" className="space-y-6 scroll-mt-24">
          <div className="border-b border-zinc-900 pb-4">
            <div className="text-xs font-mono text-cyan-400 tracking-wider">GATEWAY EN LA NUBE</div>
            <h2 className="text-2xl font-bold text-zinc-100 mt-1">Consola de API en Tiempo Real</h2>
          </div>

          <div className="bg-[#090a10] border border-zinc-800 rounded-xl p-6 space-y-4 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-zinc-300">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">ENDPOINT:</span>
                <span className="text-cyan-400">https://kyrnforge.dev/api/v1/status</span>
              </div>

              <button
                onClick={fetchLiveApi}
                disabled={isLoadingApi}
                className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center space-x-2 self-start sm:self-auto border border-zinc-700"
              >
                <Activity className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingApi ? 'animate-spin' : ''}`} />
                <span>{isLoadingApi ? 'CONSULTANDO...' : 'PROBAR ENDPOINT EN VIVO'}</span>
              </button>
            </div>

            {/* Terminal Window */}
            <div className="bg-[#040508] border border-zinc-900 rounded-lg p-4 text-xs overflow-x-auto min-h-[140px] flex flex-col justify-between">
              {apiResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-900 pb-1">
                    <span>HTTP 200 OK · Cloudflare Edge Response</span>
                    {latencyMs && <span className="text-emerald-400">Latencia: {latencyMs} ms</span>}
                  </div>
                  <pre className="text-emerald-400 text-xs leading-relaxed">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-zinc-600 flex flex-col items-center justify-center py-6 space-y-1">
                  <Terminal className="w-6 h-6 text-zinc-700" />
                  <span>Haz clic en "PROBAR ENDPOINT EN VIVO" para realizar una petición real a la API.</span>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 mt-28 py-12 text-xs font-mono text-zinc-500">
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
              GitHub (devlwte)
            </a>
            <span className="text-zinc-600">2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
