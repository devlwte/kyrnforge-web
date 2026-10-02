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
  ArrowRight, 
  Zap, 
  ShoppingBag, 
  Sparkles, 
  Server, 
  Key, 
  CheckCircle, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  FileDown, 
  FileUp, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Eye, 
  LogOut, 
  Home, 
  AlertTriangle,
  FolderOpen,
  Sliders,
  Globe2,
  Save,
  LayoutGrid,
  Info
} from 'lucide-react';
import { initialAvailableApps } from '../data/defaultApps';
import { initialProjects, initialSiteSettings } from '../data/defaultSiteData';

const STORAGE_KEY_APPS = 'kyrnforge_available_apps';
const STORAGE_KEY_PROJECTS = 'kyrnforge_projects';
const STORAGE_KEY_SETTINGS = 'kyrnforge_site_settings';
const AUTH_KEY = 'kyrnforge_mod_auth';
const DEFAULT_PASS = 'kyrnforge2026';

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
  Globe2
};

// Preset styling options for Carousel Apps
const GLOW_THEMES = [
  { id: 'glow-cyan', name: 'Cyan Neón', border: 'border-cyan-500/40', btn: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-500/25', accent: 'text-cyan-400', badge: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400' },
  { id: 'glow-purple', name: 'Púrpura Synth', border: 'border-purple-500/40', btn: 'bg-purple-500 hover:bg-purple-400 text-zinc-950 shadow-purple-500/25', accent: 'text-purple-400', badge: 'border-purple-500/30 bg-purple-950/40 text-purple-400' },
  { id: 'glow-amber', name: 'Ámbar Gamer', border: 'border-amber-500/40', btn: 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/25', accent: 'text-amber-400', badge: 'border-amber-500/30 bg-amber-950/40 text-amber-400' },
  { id: 'glow-emerald', name: 'Esmeralda Matrix', border: 'border-emerald-500/40', btn: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25', accent: 'text-emerald-400', badge: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400' },
  { id: 'glow-rose', name: 'Rosa Carmesí', border: 'border-rose-500/40', btn: 'bg-rose-500 hover:bg-rose-400 text-zinc-950 shadow-rose-500/25', accent: 'text-rose-400', badge: 'border-rose-500/30 bg-rose-950/40 text-rose-400' },
  { id: 'glow-blue', name: 'Azul Eléctrico', border: 'border-blue-500/40', btn: 'bg-blue-500 hover:bg-blue-400 text-zinc-950 shadow-blue-500/25', accent: 'text-blue-400', badge: 'border-blue-500/30 bg-blue-950/40 text-blue-400' }
];

// Preset badges for Projects
const PROJECT_BADGES = [
  { id: 'emerald', label: 'Verde (Producción)', class: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30' },
  { id: 'amber', label: 'Ámbar (En Desarrollo)', class: 'border-amber-500/40 text-amber-400 bg-amber-950/30' },
  { id: 'cyan', label: 'Cyan (Arquitectura / Engine)', class: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30' },
  { id: 'purple', label: 'Púrpura (Plataforma)', class: 'border-purple-500/40 text-purple-400 bg-purple-950/30' },
  { id: 'blue', label: 'Azul (Utilidad)', class: 'border-blue-500/40 text-blue-400 bg-blue-950/30' },
  { id: 'rose', label: 'Rojo / Rosa (Alpha / Experimental)', class: 'border-rose-500/40 text-rose-400 bg-rose-950/30' }
];

const PRESET_ICONS = [
  { name: 'KPM Studio', path: '/projects/kpm.png' },
  { name: 'Kyrnex Platform', path: '/projects/kyrnex.png' },
  { name: 'PlayWarp Hub', path: '/projects/playwarp.svg' },
  { name: '2DGO Engine', path: '/projects/2dgo.png' },
  { name: 'Icono por Defecto (SVG)', path: '/projects/default-app.svg' },
  { name: 'Logo KyrnForge', path: '/logo.svg' }
];

export default function ModDashboard({ onNavigateHome }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active Management Tab: 'apps' | 'projects' | 'hero' | 'backup'
  const [activeTab, setActiveTab] = useState('apps');

  // --- STATE 1: Apps Carousel ---
  const [apps, setApps] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading apps from localStorage", e);
    }
    return initialAvailableApps;
  });

  // --- STATE 2: Projects Catalog ---
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading projects from localStorage", e);
    }
    return initialProjects;
  });

  // --- STATE 3: Site Settings (Hero & Metrics) ---
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.hero) return parsed;
      }
    } catch (e) {
      console.error("Error loading siteSettings from localStorage", e);
    }
    return initialSiteSettings;
  });

  // Modals & UI helpers
  const [editingApp, setEditingApp] = useState(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportDataString, setExportDataString] = useState('');
  const [exportDataType, setExportDataType] = useState('full'); // 'full' | 'apps' | 'projects' | 'settings'
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importError, setImportError] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState('');

  // Persist Apps to both Backend API and localStorage
  const saveApps = async (newApps) => {
    setApps(newApps);
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(newApps, null, 2));

    try {
      const auth = passwordInput || localStorage.getItem(AUTH_KEY) === 'true' ? 'kyrnforge2026' : DEFAULT_PASS;
      const res = await fetch('/api/v1/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        body: JSON.stringify(newApps)
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('✓ Apps sincronizadas y guardadas en el servidor (src/data/defaultApps.js)');
        return;
      }
    } catch (err) {
      console.warn("API de servidor no disponible o modo estático:", err);
    }
    showToast('Carrusel de apps actualizado correctamente');
  };

  // Persist Projects to both Backend API and localStorage
  const saveProjects = async (newProjects) => {
    setProjects(newProjects);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(newProjects, null, 2));

    try {
      const auth = passwordInput || localStorage.getItem(AUTH_KEY) === 'true' ? 'kyrnforge2026' : DEFAULT_PASS;
      const res = await fetch('/api/v1/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        body: JSON.stringify({ projects: newProjects })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('✓ Proyectos guardados en el servidor (src/data/defaultSiteData.js)');
        return;
      }
    } catch (err) {
      console.warn("API de servidor no disponible o modo estático:", err);
    }
    showToast('Catálogo de proyectos actualizado correctamente');
  };

  // Persist Site Settings to both Backend API and localStorage
  const saveSiteSettings = async (newSettings) => {
    setSiteSettings(newSettings);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings, null, 2));

    try {
      const auth = passwordInput || localStorage.getItem(AUTH_KEY) === 'true' ? 'kyrnforge2026' : DEFAULT_PASS;
      const res = await fetch('/api/v1/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        body: JSON.stringify({ siteSettings: newSettings })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('✓ Configuración guardada en el servidor (src/data/defaultSiteData.js)');
        return;
      }
    } catch (err) {
      console.warn("API de servidor no disponible o modo estático:", err);
    }
    showToast('Configuraciones de portada y métricas guardadas');
  };

  const showToast = (msg) => {
    setSaveSuccessToast(msg);
    setTimeout(() => setSaveSuccessToast(''), 3500);
  };

  // Auth Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === DEFAULT_PASS || passwordInput === 'admin') {
      setIsAuthenticated(true);
      setAuthError(false);
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    setPasswordInput('');
  };

  // --- APP CRUD OPERATIONS ---
  const handleOpenAddApp = () => {
    const nextTag = String(apps.length + 1).padStart(2, '0');
    setEditingApp({
      id: `app-${Date.now().toString(36)}`,
      tag: nextTag,
      shortName: 'Nueva App',
      title: 'Título de la Aplicación',
      badge: 'v1.0.0 Oficial',
      badgeColor: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-400',
      category: 'Software Nativo',
      system: 'Windows 10/11 (64-bit) · Instalador Oficial',
      iconImg: '/projects/default-app.svg',
      iconScale: '',
      glowClass: 'glow-cyan',
      themeBorder: 'border-cyan-500/40',
      btnBg: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-500/25',
      accentText: 'text-cyan-400',
      description: 'Descripción detallada de la aplicación, utilidades clave y arquitectura de compresión o renderizado.',
      features: [
        { label: 'Característica 1', iconName: 'Shield', color: 'text-cyan-400' },
        { label: 'Característica 2', iconName: 'Zap', color: 'text-emerald-400' },
        { label: 'Característica 3', iconName: 'Cpu', color: 'text-purple-400' }
      ],
      downloadUrl: 'https://github.com/devlwte',
      downloadLabel: 'DESCARGAR SETUP (.ZIP)',
      repoUrl: 'https://github.com/devlwte',
      metaInfo: 'Verificación SHA-256 · Freeware Legal'
    });
    setIsAppModalOpen(true);
  };

  const handleOpenEditApp = (app) => {
    setEditingApp(JSON.parse(JSON.stringify(app)));
    setIsAppModalOpen(true);
  };

  const handleSaveAppForm = (e) => {
    e.preventDefault();
    if (!editingApp.id || !editingApp.title) return;

    const exists = apps.some(a => a.id === editingApp.id);
    let updated;
    if (exists) {
      updated = apps.map(a => a.id === editingApp.id ? editingApp : a);
    } else {
      updated = [...apps, editingApp];
    }
    // Re-index tags
    updated = updated.map((a, i) => ({
      ...a,
      tag: String(i + 1).padStart(2, '0')
    }));

    saveApps(updated);
    setIsAppModalOpen(false);
    setEditingApp(null);
  };

  const handleDeleteApp = (id) => {
    if (apps.length <= 1) {
      alert("Debe haber al menos 1 aplicación en el carrusel.");
      return;
    }
    if (confirm("¿Estás seguro de eliminar esta aplicación del carrusel?")) {
      const updated = apps.filter(a => a.id !== id).map((a, i) => ({
        ...a,
        tag: String(i + 1).padStart(2, '0')
      }));
      saveApps(updated);
    }
  };

  const moveApp = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= apps.length) return;
    const newApps = [...apps];
    const [moved] = newApps.splice(index, 1);
    newApps.splice(targetIndex, 0, moved);
    const updated = newApps.map((a, i) => ({
      ...a,
      tag: String(i + 1).padStart(2, '0')
    }));
    saveApps(updated);
  };

  // --- PROJECT CRUD OPERATIONS ---
  const handleOpenAddProject = () => {
    setEditingProject({
      id: `proj-${Date.now().toString(36)}`,
      category: 'gaming',
      categoryLabel: 'Videojuegos & Plataforma',
      title: 'Nuevo Proyecto',
      version: 'v1.0 (En Desarrollo)',
      status: 'dev',
      statusLabel: 'En Desarrollo Activo',
      badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
      iconImg: '/projects/default-app.svg',
      iconName: 'Gamepad2',
      iconColor: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
      description: 'Breve sinopsis del proyecto, objetivos y estado actual de la arquitectura.',
      tags: ['Videojuegos', 'Nativo', 'En Desarrollo'],
      downloadUrl: '',
      repoUrl: 'https://github.com/devlwte',
      isFlagship: false
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project) => {
    setEditingProject(JSON.parse(JSON.stringify(project)));
    setIsProjectModalOpen(true);
  };

  const handleSaveProjectForm = (e) => {
    e.preventDefault();
    if (!editingProject.id || !editingProject.title) return;

    const exists = projects.some(p => p.id === editingProject.id);
    let updated;
    if (exists) {
      updated = projects.map(p => p.id === editingProject.id ? editingProject : p);
    } else {
      updated = [...projects, editingProject];
    }

    saveProjects(updated);
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id) => {
    if (confirm("¿Estás seguro de eliminar este proyecto del catálogo?")) {
      const updated = projects.filter(p => p.id !== id);
      saveProjects(updated);
    }
  };

  const moveProject = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const newProjects = [...projects];
    const [moved] = newProjects.splice(index, 1);
    newProjects.splice(targetIndex, 0, moved);
    saveProjects(newProjects);
  };

  // --- SITE SETTINGS HANDLERS ---
  const handleHeroChange = (field, value) => {
    setSiteSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  const handleMetricChange = (index, field, value) => {
    setSiteSettings(prev => {
      const updatedMetrics = [...prev.metrics];
      updatedMetrics[index] = {
        ...updatedMetrics[index],
        [field]: value
      };
      return {
        ...prev,
        metrics: updatedMetrics
      };
    });
  };

  const handleFooterChange = (field, value) => {
    setSiteSettings(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: value
      }
    }));
  };

  // --- EXPORT / IMPORT MODAL HANDLERS ---
  const openExportModal = (type = 'full') => {
    setExportDataType(type);
    let data;
    if (type === 'full') {
      data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        siteSettings,
        availableApps: apps,
        projects
      };
    } else if (type === 'apps') {
      data = apps;
    } else if (type === 'projects') {
      data = projects;
    } else if (type === 'settings') {
      data = siteSettings;
    }
    setExportDataString(JSON.stringify(data, null, 2));
    setCopiedExport(false);
    setIsExportModalOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportDataString);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const downloadJsonFile = () => {
    const filename = exportDataType === 'full' 
      ? `kyrnforge_complete_backup_${new Date().toISOString().slice(0, 10)}.json`
      : `kyrnforge_${exportDataType}.json`;
    const blob = new Blob([exportDataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    setImportError('');
    try {
      const parsed = JSON.parse(importJsonInput);
      
      // Auto-detect format: Full Backup or Individual Array
      if (parsed.siteSettings && (parsed.availableApps || parsed.projects)) {
        // Full Backup
        if (Array.isArray(parsed.availableApps) && parsed.availableApps.length > 0) {
          saveApps(parsed.availableApps);
        }
        if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
          saveProjects(parsed.projects);
        }
        if (parsed.siteSettings) {
          saveSiteSettings(parsed.siteSettings);
        }
        showToast("Copia de seguridad completa restaurada con éxito.");
      } else if (Array.isArray(parsed)) {
        // Array: check if apps or projects
        if (parsed[0]?.downloadLabel !== undefined || parsed[0]?.glowClass !== undefined) {
          saveApps(parsed);
          showToast("Catálogo de aplicaciones del carrusel importado.");
        } else {
          saveProjects(parsed);
          showToast("Catálogo de proyectos importado.");
        }
      } else if (parsed.hero && parsed.metrics) {
        saveSiteSettings(parsed);
        showToast("Configuraciones de portada importadas.");
      } else {
        throw new Error("Estructura JSON no reconocida. Asegúrate de pegar un respaldo válido de KyrnForge.");
      }
      setIsImportModalOpen(false);
      setImportJsonInput('');
    } catch (err) {
      setImportError(err.message || 'El JSON ingresado no es válido.');
    }
  };

  const resetAllToFactory = () => {
    if (confirm("¿Estás seguro de restablecer TODO el sitio a los valores iniciales de fábrica? Se perderán las modificaciones locales no exportadas.")) {
      saveApps(initialAvailableApps);
      saveProjects(initialProjects);
      saveSiteSettings(initialSiteSettings);
      showToast("Todo el sitio ha sido restablecido a valores de fábrica.");
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050609] text-zinc-100 font-sans flex items-center justify-center p-4 relative selection:bg-cyan-500/20 selection:text-cyan-300">
        <div className="fixed top-[-100px] left-[20%] w-[500px] h-[500px] bg-cyan-950/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-100px] right-[20%] w-[500px] h-[500px] bg-purple-950/20 blur-[150px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-[#0a0c12] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-cyan-400 tracking-wider">KYRNFORGE ACCESOS PRIVADOS</div>
            <h1 className="text-2xl font-bold text-zinc-100">Panel de Administración</h1>
            <p className="text-xs text-zinc-400">
              Gestiona el carrusel de apps, catálogo de proyectos en desarrollo y textos del portal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Clave de Administrador</span>
                <span className="text-[10px] text-zinc-500 font-normal">Por defecto: kyrnforge2026</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="Introduce la contraseña..."
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition"
                  autoFocus
                />
              </div>
              {authError && (
                <div className="text-xs font-mono text-rose-400 pt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Contraseña incorrecta. Intenta con <code className="text-zinc-200">kyrnforge2026</code> o <code className="text-zinc-200">admin</code>.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>INGRESAR AL PANEL</span>
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-900 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition flex items-center justify-center space-x-1.5 mx-auto"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Volver al sitio público (kyrnforge.dev)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 font-sans bg-tech-grid relative selection:bg-cyan-500/20 selection:text-cyan-300 pb-24">
      
      {/* Toast Notification */}
      {saveSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0e121e] border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl font-mono text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#06070a]/90 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm text-zinc-100">KYRNFORGE MOD</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  ADMIN CONSOLE
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-500">Gestor Integral de Contenido y Datos</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition flex items-center space-x-1.5"
              title="Volver a la vista pública de la web"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Ver Sitio Web</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500/40 text-xs font-mono text-zinc-400 hover:text-rose-400 transition flex items-center space-x-1.5"
              title="Cerrar sesión de moderador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="border-t border-zinc-900/80 bg-[#07090e]/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto space-x-2 py-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab('apps')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'apps'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>1. Carrusel Descargas ({apps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>2. Línea de Proyectos ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('hero')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'hero'
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>3. Portada & Métricas</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'backup'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>4. Respaldo & Exportación</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* ========================================================================= */}
        {/* TAB 1: CAROUSEL APPS MANAGEMENT                                           */}
        {/* ========================================================================= */}
        {activeTab === 'apps' && (
          <section className="space-y-6 animate-fadeIn">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0a0c12] border border-zinc-800/90">
              <div>
                <div className="text-xs font-mono text-cyan-400 flex items-center space-x-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>SECCIÓN: SOFTWARE LISTO PARA DESCARGAR</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-0.5">
                  Carrusel de Aplicaciones Disponibles
                </h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Edita las aplicaciones que aparecen en el carrusel de un solo item. Los cambios se guardan al instante en tu navegador.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenAddApp}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>NUEVA APP</span>
                </button>
                <button
                  onClick={() => openExportModal('apps')}
                  className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition flex items-center space-x-1.5"
                >
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Exportar Apps</span>
                </button>
              </div>
            </div>

            {/* Apps List */}
            <div className="space-y-3">
              {apps.map((app, index) => (
                <div
                  key={app.id}
                  className={`p-4 sm:p-5 rounded-xl bg-[#080a10] border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden`}
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        onClick={() => moveApp(index, -1)}
                        disabled={index === 0}
                        className={`p-1 rounded border text-zinc-400 ${index === 0 ? 'opacity-30 cursor-not-allowed border-zinc-900' : 'hover:bg-zinc-800 hover:text-zinc-100 border-zinc-800'}`}
                        title="Subir posición"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono text-zinc-500 font-bold">{app.tag}</span>
                      <button
                        onClick={() => moveApp(index, 1)}
                        disabled={index === apps.length - 1}
                        className={`p-1 rounded border text-zinc-400 ${index === apps.length - 1 ? 'opacity-30 cursor-not-allowed border-zinc-900' : 'hover:bg-zinc-800 hover:text-zinc-100 border-zinc-800'}`}
                        title="Bajar posición"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className={`w-14 h-14 rounded-xl bg-[#0c0e17] border ${app.themeBorder || 'border-zinc-800'} overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <img 
                        src={app.iconImg} 
                        alt={app.title} 
                        className={`w-full h-full object-cover ${app.iconScale || ''}`}
                        onError={(e) => {
                          e.currentTarget.src = "/projects/default-app.svg";
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-100">{app.title}</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${app.badgeColor}`}>
                          {app.badge}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Pestaña: {app.shortName}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-zinc-400">{app.category} · {app.system}</p>
                      <p className="text-xs text-zinc-500 line-clamp-1 max-w-xl">{app.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-center">
                    <button
                      onClick={() => handleOpenEditApp(app)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition flex items-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500/40 text-xs font-mono text-zinc-500 hover:text-rose-400 transition"
                      title="Eliminar app del carrusel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PROJECTS CATALOG MANAGEMENT                                        */}
        {/* ========================================================================= */}
        {activeTab === 'projects' && (
          <section className="space-y-6 animate-fadeIn">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0a0c12] border border-zinc-800/90">
              <div>
                <div className="text-xs font-mono text-amber-400 flex items-center space-x-1.5">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>SECCIÓN: ECOSISTEMA KYRNFORGE & VIDEOJUEGOS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-0.5">
                  Catálogo de Proyectos en Desarrollo
                </h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Gestiona la lista de proyectos, videojuegos y motores en desarrollo (PlayWarp, 2DGO, GetGame, etc.).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenAddProject}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>NUEVO PROYECTO</span>
                </button>
                <button
                  onClick={() => openExportModal('projects')}
                  className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition flex items-center space-x-1.5"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exportar Proyectos</span>
                </button>
              </div>
            </div>

            {/* Projects Grid List */}
            <div className="space-y-3">
              {projects.map((proj, index) => (
                <div
                  key={proj.id}
                  className="p-4 sm:p-5 rounded-xl bg-[#080a10] border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        onClick={() => moveProject(index, -1)}
                        disabled={index === 0}
                        className={`p-1 rounded border text-zinc-400 ${index === 0 ? 'opacity-30 cursor-not-allowed border-zinc-900' : 'hover:bg-zinc-800 hover:text-zinc-100 border-zinc-800'}`}
                        title="Subir posición"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono text-zinc-500 font-bold">{index + 1}</span>
                      <button
                        onClick={() => moveProject(index, 1)}
                        disabled={index === projects.length - 1}
                        className={`p-1 rounded border text-zinc-400 ${index === projects.length - 1 ? 'opacity-30 cursor-not-allowed border-zinc-900' : 'hover:bg-zinc-800 hover:text-zinc-100 border-zinc-800'}`}
                        title="Bajar posición"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-[#0c0e17] border border-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md">
                      {proj.iconImg ? (
                        <img 
                          src={proj.iconImg} 
                          alt={proj.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/projects/default-app.svg";
                          }}
                        />
                      ) : (
                        <img 
                          src="/projects/default-app.svg" 
                          alt="Default Icon" 
                          className="w-full h-full object-cover opacity-80"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-100">{proj.title}</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${proj.badgeColor || 'border-zinc-800 text-zinc-400 bg-zinc-900'}`}>
                          {proj.statusLabel || proj.version}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {proj.categoryLabel || proj.category}
                        </span>
                        {proj.isFlagship && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
                            Flagship
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 font-mono text-[9px] pt-0.5">
                        {proj.tags && proj.tags.map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-center">
                    <button
                      onClick={() => handleOpenEditProject(proj)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-amber-400 hover:text-amber-300 transition flex items-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500/40 text-xs font-mono text-zinc-500 hover:text-rose-400 transition"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SITE SETTINGS (HERO & METRICS)                                     */}
        {/* ========================================================================= */}
        {activeTab === 'hero' && (
          <section className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0c12] border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-purple-400 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>SECCIÓN: PORTADA HERO & MÉTRICAS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-0.5">
                  Textos Principales & Métricas de la Web
                </h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Modifica los titulares de la portada, el lema y las 4 tarjetas de métricas que dan la bienvenida al visitante.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => saveSiteSettings(siteSettings)}
                  className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-purple-500/20 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>GUARDAR CAMBIOS</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Hero Textos */}
              <div className="p-5 rounded-xl bg-[#080a10] border border-zinc-800/80 space-y-4">
                <h3 className="text-sm font-mono font-bold text-zinc-200 border-b border-zinc-800/80 pb-2 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Textos de Portada (Hero Section)</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Lema / Badge Superior</label>
                  <input
                    type="text"
                    value={siteSettings.hero.tagline}
                    onChange={(e) => handleHeroChange('tagline', e.target.value)}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Título Principal (H1)</label>
                  <textarea
                    rows={2}
                    value={siteSettings.hero.title}
                    onChange={(e) => handleHeroChange('title', e.target.value)}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-sm font-sans font-bold text-zinc-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Párrafo de Descripción</label>
                  <textarea
                    rows={4}
                    value={siteSettings.hero.description}
                    onChange={(e) => handleHeroChange('description', e.target.value)}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Botón 1 (Apps)</label>
                    <input
                      type="text"
                      value={siteSettings.hero.buttonAppsText}
                      onChange={(e) => handleHeroChange('buttonAppsText', e.target.value)}
                      className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Botón 2 (Proyectos)</label>
                    <input
                      type="text"
                      value={siteSettings.hero.buttonProjectsText}
                      onChange={(e) => handleHeroChange('buttonProjectsText', e.target.value)}
                      className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: 4 Metrics Cards */}
              <div className="p-5 rounded-xl bg-[#080a10] border border-zinc-800/80 space-y-4">
                <h3 className="text-sm font-mono font-bold text-zinc-200 border-b border-zinc-800/80 pb-2 flex items-center space-x-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-400" />
                  <span>Tarjetas de Métricas Rápidas (4 Slots)</span>
                </h3>

                <div className="space-y-3">
                  {siteSettings.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0b0d14] border border-zinc-800/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>Tarjeta #{idx + 1}</span>
                        <span className="text-zinc-400 font-bold">{m.color.replace('text-', '')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">Etiqueta Superior</label>
                          <input
                            type="text"
                            value={m.label}
                            onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                            className="w-full bg-[#050608] border border-zinc-800 rounded px-2.5 py-1 text-xs font-mono text-zinc-300"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">Valor Destacado</label>
                          <input
                            type="text"
                            value={m.value}
                            onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                            className="w-full bg-[#050608] border border-zinc-800 rounded px-2.5 py-1 text-xs font-mono text-zinc-100 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => saveSiteSettings(siteSettings)}
                    className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs transition flex items-center justify-center space-x-2"
                  >
                    <Save className="w-3.5 h-3.5 text-purple-400" />
                    <span>GUARDAR CONFIGURACIÓN</span>
                  </button>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BACKUP & EXPORT MANAGEMENT                                         */}
        {/* ========================================================================= */}
        {activeTab === 'backup' && (
          <section className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0c12] border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
                  <FileDown className="w-3.5 h-3.5" />
                  <span>COPIAS DE SEGURIDAD & EXPORTACIÓN TOTAL</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-0.5">
                  Exportar e Importar Datos del Sitio
                </h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Descarga un archivo JSON de respaldo completo de todo lo configurado o pega un respaldo para restaurar el sitio.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openExportModal('full')}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <FileDown className="w-4 h-4" />
                  <span>EXPORTAR TODO EL SITIO</span>
                </button>
                <button
                  onClick={() => {
                    setImportError('');
                    setImportJsonInput('');
                    setIsImportModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition flex items-center space-x-1.5"
                >
                  <FileUp className="w-4 h-4 text-cyan-400" />
                  <span>Restaurar / Importar</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Apps Carousel Backup */}
              <div className="p-5 rounded-xl bg-[#080a10] border border-zinc-800/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span className="flex items-center space-x-1.5">
                      <Download className="w-4 h-4" />
                      <span>CARRUSEL APPS</span>
                    </span>
                    <span className="text-zinc-500">{apps.length} items</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-200">Datos de Aplicaciones</h4>
                  <p className="text-xs text-zinc-400">
                    Exporta únicamente los objetos de software con enlaces, tags y temas visuales.
                  </p>
                </div>
                <button
                  onClick={() => openExportModal('apps')}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-cyan-400 transition flex items-center justify-center space-x-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Exportar Apps (.json)</span>
                </button>
              </div>

              {/* Card 2: Projects Catalog Backup */}
              <div className="p-5 rounded-xl bg-[#080a10] border border-zinc-800/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                    <span className="flex items-center space-x-1.5">
                      <Gamepad2 className="w-4 h-4" />
                      <span>PROYECTOS & JUEGOS</span>
                    </span>
                    <span className="text-zinc-500">{projects.length} items</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-200">Catálogo de Proyectos</h4>
                  <p className="text-xs text-zinc-400">
                    Exporta todos los proyectos en desarrollo con sus estados, categorías y badges.
                  </p>
                </div>
                <button
                  onClick={() => openExportModal('projects')}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-amber-400 transition flex items-center justify-center space-x-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Exportar Proyectos (.json)</span>
                </button>
              </div>

              {/* Card 3: Factory Reset */}
              <div className="p-5 rounded-xl bg-[#080a10] border border-zinc-800/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-rose-400">
                    <span className="flex items-center space-x-1.5">
                      <RotateCcw className="w-4 h-4" />
                      <span>VALORES DE FÁBRICA</span>
                    </span>
                    <span className="text-zinc-500">Reset</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-200">Restablecer Todo</h4>
                  <p className="text-xs text-zinc-400">
                    Restaura todo el contenido a la versión predeterminada del código fuente inicial.
                  </p>
                </div>
                <button
                  onClick={resetAllToFactory}
                  className="w-full py-2 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/30 hover:border-rose-500/60 text-xs font-mono text-rose-300 transition flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Todo</span>
                </button>
              </div>

            </div>

            {/* Git Code Integration Instructions */}
            <div className="p-5 rounded-xl bg-[#07090e] border border-zinc-800/60 space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                <Info className="w-4 h-4" />
                <span>¿Cómo aplicar estos cambios permanentemente en el código de GitHub?</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Los cambios que realizas aquí se guardan de forma instantánea y persistente en el <code className="text-zinc-200">localStorage</code> de tu navegador. Si deseas que se queden grabados permanentemente en el repositorio de Git para todos los visitantes del mundo:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 pl-1">
                <li>Haz clic en <strong className="text-cyan-400">EXPORTAR TODO EL SITIO</strong> y copia el JSON.</li>
                <li>Pega los arreglos correspondientes en los archivos <code className="text-emerald-400">src/data/defaultApps.js</code> y <code className="text-emerald-400">src/data/defaultSiteData.js</code>.</li>
                <li>Ejecuta el script <code className="text-amber-400">deploy-web.bat</code> para compilar y desplegar a Cloudflare y GitHub automáticamente.</li>
              </ol>
            </div>
          </section>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT APP                                                     */}
      {/* ========================================================================= */}
      {isAppModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0e17] border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 my-8 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-zinc-100">
                  {apps.some(a => a.id === editingApp.id) ? 'Editar Aplicación del Carrusel' : 'Agregar Nueva Aplicación al Carrusel'}
                </h3>
              </div>
              <button
                onClick={() => setIsAppModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAppForm} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">ID Único (slug)</label>
                  <input
                    type="text"
                    required
                    value={editingApp.id}
                    onChange={(e) => setEditingApp({ ...editingApp, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Nombre Corto (Pestaña carrusel)</label>
                  <input
                    type="text"
                    required
                    value={editingApp.shortName}
                    onChange={(e) => setEditingApp({ ...editingApp, shortName: e.target.value })}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400">Título Completo</label>
                <input
                  type="text"
                  required
                  value={editingApp.title}
                  onChange={(e) => setEditingApp({ ...editingApp, title: e.target.value })}
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Badge / Versión</label>
                  <input
                    type="text"
                    value={editingApp.badge}
                    onChange={(e) => setEditingApp({ ...editingApp, badge: e.target.value })}
                    placeholder="v1.0.0 Oficial"
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Categoría</label>
                  <input
                    type="text"
                    value={editingApp.category}
                    onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value })}
                    placeholder="Software de Empaquetado & Compresión"
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400">Compatibilidad / Sistema</label>
                <input
                  type="text"
                  value={editingApp.system}
                  onChange={(e) => setEditingApp({ ...editingApp, system: e.target.value })}
                  placeholder="Windows 10 & 11 (64-bit) · Instalador Setup Oficial y Modo Portable"
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                />
              </div>

              {/* Icon Selector */}
              <div className="space-y-2 p-3 rounded-lg bg-[#07090e] border border-zinc-800/80">
                <label className="text-xs font-mono text-zinc-300 block">Ruta del Icono (100% x 100%)</label>
                <input
                  type="text"
                  value={editingApp.iconImg}
                  onChange={(e) => setEditingApp({ ...editingApp, iconImg: e.target.value })}
                  placeholder="/projects/kpm.png o URL"
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-zinc-500">Presets rápidos:</span>
                  {PRESET_ICONS.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setEditingApp({ ...editingApp, iconImg: p.path })}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2 p-3 rounded-lg bg-[#07090e] border border-zinc-800/80">
                <label className="text-xs font-mono text-zinc-300 block">Tema Visual & Color de Resplandor</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GLOW_THEMES.map((theme) => (
                    <button
                      type="button"
                      key={theme.id}
                      onClick={() => setEditingApp({
                        ...editingApp,
                        glowClass: theme.id,
                        themeBorder: theme.border,
                        btnBg: theme.btn,
                        accentText: theme.accent,
                        badgeColor: theme.badge
                      })}
                      className={`p-2 rounded-lg border text-xs font-mono text-left transition flex items-center space-x-2 ${
                        editingApp.glowClass === theme.id ? `${theme.border} bg-zinc-900 text-zinc-100 font-bold` : 'border-zinc-900 bg-[#050608] text-zinc-400'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.accent.replace('text-', 'bg-')}`} />
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400">Descripción</label>
                <textarea
                  rows={3}
                  value={editingApp.description}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Enlace de Descarga</label>
                  <input
                    type="text"
                    value={editingApp.downloadUrl}
                    onChange={(e) => setEditingApp({ ...editingApp, downloadUrl: e.target.value })}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Texto del Botón Descarga</label>
                  <input
                    type="text"
                    value={editingApp.downloadLabel}
                    onChange={(e) => setEditingApp({ ...editingApp, downloadLabel: e.target.value })}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Enlace GitHub</label>
                  <input
                    type="text"
                    value={editingApp.repoUrl}
                    onChange={(e) => setEditingApp({ ...editingApp, repoUrl: e.target.value })}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Nota al Pie (Meta)</label>
                  <input
                    type="text"
                    value={editingApp.metaInfo}
                    onChange={(e) => setEditingApp({ ...editingApp, metaInfo: e.target.value })}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition shadow-lg shadow-cyan-500/20"
                >
                  Guardar Aplicación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PROJECT                                                 */}
      {/* ========================================================================= */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0e17] border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 my-8 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-zinc-100">
                  {projects.some(p => p.id === editingProject.id) ? 'Editar Proyecto del Catálogo' : 'Agregar Nuevo Proyecto al Catálogo'}
                </h3>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProjectForm} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">ID Único (slug)</label>
                  <input
                    type="text"
                    required
                    value={editingProject.id}
                    onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Categoría Filtro</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  >
                    <option value="gaming">Gaming (Videojuegos / Plataformas)</option>
                    <option value="tools">Herramientas & Web / Plataforma</option>
                    <option value="featured">Featured / Destacado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400">Nombre del Proyecto</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Etiqueta de Categoría</label>
                  <input
                    type="text"
                    value={editingProject.categoryLabel}
                    onChange={(e) => setEditingProject({ ...editingProject, categoryLabel: e.target.value })}
                    placeholder="Videojuegos & Plataforma"
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Estado / Etiqueta del Badge</label>
                  <input
                    type="text"
                    value={editingProject.statusLabel}
                    onChange={(e) => setEditingProject({ ...editingProject, statusLabel: e.target.value })}
                    placeholder="En Desarrollo Activo"
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              {/* Badge Color Preset */}
              <div className="space-y-2 p-3 rounded-lg bg-[#07090e] border border-zinc-800/80">
                <label className="text-xs font-mono text-zinc-300 block">Color del Badge</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROJECT_BADGES.map((b) => (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => setEditingProject({ ...editingProject, badgeColor: b.class })}
                      className={`p-2 rounded-lg border text-xs font-mono text-left transition flex items-center space-x-2 ${
                        editingProject.badgeColor === b.class ? 'border-amber-500 bg-zinc-900 text-zinc-100 font-bold' : 'border-zinc-900 bg-[#050608] text-zinc-400'
                      }`}
                    >
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${b.class}`}>
                        Preview
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-2 p-3 rounded-lg bg-[#07090e] border border-zinc-800/80">
                <label className="text-xs font-mono text-zinc-300 block">Icono de Proyecto (dejar vacío para usar icono por defecto)</label>
                <input
                  type="text"
                  value={editingProject.iconImg || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, iconImg: e.target.value || null })}
                  placeholder="/projects/playwarp.svg (o vacío para default-app.svg)"
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-zinc-500">Presets rápidos:</span>
                  <button
                    type="button"
                    onClick={() => setEditingProject({ ...editingProject, iconImg: null })}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400"
                  >
                    Usar Icono por Defecto
                  </button>
                  {PRESET_ICONS.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setEditingProject({ ...editingProject, iconImg: p.path })}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400">Descripción del Proyecto</label>
                <textarea
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400">Etiquetas / Tags (separados por coma)</label>
                <input
                  type="text"
                  value={Array.isArray(editingProject.tags) ? editingProject.tags.join(', ') : ''}
                  onChange={(e) => setEditingProject({
                    ...editingProject,
                    tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Game Launcher, Catálogo Multi-Tienda, 100% Legal"
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Enlace Repositorio GitHub (opcional)</label>
                  <input
                    type="text"
                    value={editingProject.repoUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, repoUrl: e.target.value || null })}
                    placeholder="https://github.com/devlwte/..."
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">Enlace Descarga (opcional)</label>
                  <input
                    type="text"
                    value={editingProject.downloadUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, downloadUrl: e.target.value || null })}
                    placeholder="https://..."
                    className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="flagship-check"
                  checked={editingProject.isFlagship || false}
                  onChange={(e) => setEditingProject({ ...editingProject, isFlagship: e.target.checked })}
                  className="rounded border-zinc-800 bg-[#050608] text-cyan-500 focus:ring-0"
                />
                <label htmlFor="flagship-check" className="text-xs font-mono text-zinc-300">
                  Marcar como Proyecto Insignia (Flagship)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold transition shadow-lg shadow-amber-500/20"
                >
                  Guardar Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXPORT DATA                                                        */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e17] border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileDown className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-zinc-100">
                  Exportar Datos ({exportDataType === 'full' ? 'Respaldo Completo' : exportDataType})
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Descarga este archivo JSON o cópialo al portapapeles para restaurarlo cuando desees o incluirlo en el código fuente.
            </p>

            <div className="relative">
              <textarea
                readOnly
                rows={12}
                value={exportDataString}
                className="w-full bg-[#050608] border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono transition flex items-center space-x-1.5"
              >
                {copiedExport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                <span>{copiedExport ? '¡COPIADO!' : 'Copiar al Portapapeles'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-mono text-xs"
                >
                  Cerrar
                </button>
                <button
                  onClick={downloadJsonFile}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Archivo JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMPORT DATA                                                        */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e17] border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileUp className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-zinc-100">Importar / Restaurar Respaldo</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Pega el contenido JSON de un respaldo (completo o individual de apps/proyectos) para sincronizarlo al instante:
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                required
                rows={10}
                value={importJsonInput}
                onChange={(e) => {
                  setImportJsonInput(e.target.value);
                  setImportError('');
                }}
                placeholder="Pega aquí el JSON exportado..."
                className="w-full bg-[#050608] border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              />

              {importError && (
                <div className="text-xs font-mono text-rose-400 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-mono text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Cargar y Restaurar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
