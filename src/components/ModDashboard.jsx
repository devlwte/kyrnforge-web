import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Terminal, 
  Download, 
  Cpu, 
  Layers, 
  Gamepad2, 
  Code2, 
  Package, 
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
  RefreshCw,
  Search,
  Activity
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
  { name: 'Kyrn DevDock', path: '/projects/kyrn-devdock.png' },
  { name: 'Kyrnex Platform', path: '/projects/kyrnex.png' },
  { name: 'PlayWarp Hub', path: '/projects/playwarp.svg' },
  { name: '2DGO Engine', path: '/projects/2dgo.png' },
  { name: 'Icono por Defecto (SVG)', path: '/projects/default-app.svg' },
  { name: 'Logo KyrnForge', path: '/logo.svg' }
];

const AVAILABLE_FEATURE_ICONS = [
  'Shield', 'Layers', 'Cpu', 'Server', 'Zap', 'Terminal', 
  'Gamepad2', 'ShoppingBag', 'Code2', 'Package', 'Sparkles', 
  'Download', 'Key', 'Globe2', 'Activity'
];

const AVAILABLE_FEATURE_COLORS = [
  { label: 'Cyan (#06b6d4)', value: 'text-cyan-400' },
  { label: 'Esmeralda (#10b981)', value: 'text-emerald-400' },
  { label: 'Púrpura (#a855f7)', value: 'text-purple-400' },
  { label: 'Ámbar (#f59e0b)', value: 'text-amber-400' },
  { label: 'Azul (#3b82f6)', value: 'text-blue-400' },
  { label: 'Rosa (#f43f5e)', value: 'text-rose-400' },
  { label: 'Blanco (#e4e4e7)', value: 'text-zinc-200' }
];

const BADGE_COLOR_PRESETS = [
  { label: 'Esmeralda Oficial', value: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400' },
  { label: 'Cyan Novedad', value: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-400' },
  { label: 'Púrpura Estable', value: 'border-purple-500/30 bg-purple-950/40 text-purple-400' },
  { label: 'Ámbar Alpha/Beta', value: 'border-amber-500/30 bg-amber-950/40 text-amber-400' },
  { label: 'Azul Utilidad', value: 'border-blue-500/30 bg-blue-950/40 text-blue-400' },
  { label: 'Rosa Experimental', value: 'border-rose-500/30 bg-rose-950/40 text-rose-400' }
];

const ICON_SCALE_PRESETS = [
  { label: 'Normal (100%)', value: '' },
  { label: 'Zoom Ligero (112%)', value: 'scale-[1.12]' },
  { label: 'Zoom Medio (120%)', value: 'scale-[1.20]' },
  { label: 'Zoom Amplio (125%)', value: 'scale-[1.25]' }
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

  // --- STATE 4: Database Status & Config ---
  const [dbStatus, setDbStatus] = useState({ connected: false, type: 'none', loading: true });
  const [showDbGuide, setShowDbGuide] = useState(false);
  const [customDbUrl, setCustomDbUrl] = useState(() => {
    try {
      return localStorage.getItem('kyrnforge_custom_db_url') || '';
    } catch {
      return '';
    }
  });
  const [isSavingDb, setIsSavingDb] = useState(false);

  // Fetch latest JSON data from server on dashboard mount
  useEffect(() => {
    const fetchRemoteData = async () => {
      try {
        const timestamp = Date.now();
        // 1. Try fetching via API (Cloudflare KV or serverless edge)
        const apiRes = await fetch(`/api/v1/content?t=${timestamp}`, { cache: 'no-store' })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null);

        if (apiRes) {
          if (apiRes.database) {
            setDbStatus(apiRes.database);
          }
          if (apiRes.availableApps && Array.isArray(apiRes.availableApps) && apiRes.availableApps.length > 0) {
            setApps(apiRes.availableApps);
            localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apiRes.availableApps));
            if (Array.isArray(apiRes.projects) && apiRes.projects.length > 0) {
              setProjects(apiRes.projects);
              localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(apiRes.projects));
            }
            if (apiRes.siteSettings && apiRes.siteSettings.hero) {
              setSiteSettings(apiRes.siteSettings);
              localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(apiRes.siteSettings));
            }
            return;
          }
        }

        // 1.5 Check External Database URL fallback
        const savedCustomUrl = localStorage.getItem('kyrnforge_custom_db_url');
        if (savedCustomUrl) {
          try {
            const cleanUrl = savedCustomUrl.replace(/\/$/, '');
            const target = cleanUrl.endsWith('.json') ? cleanUrl : `${cleanUrl}/apps.json`;
            const customApps = await fetch(`${target}?t=${timestamp}`).then(r => r.ok ? r.json() : null).catch(() => null);
            if (customApps && Array.isArray(customApps) && customApps.length > 0) {
              setApps(customApps);
              localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(customApps));
              setDbStatus({ connected: true, type: 'Base de Datos Externa' });
              return;
            }
          } catch {
            // fallback
          }
        }

        // 2. Direct static JSON fallback with cache-busting
        const [resApps, resProjects, resSettings] = await Promise.all([
          fetch(`/data/apps.json?t=${timestamp}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/data/projects.json?t=${timestamp}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`/data/settings.json?t=${timestamp}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        if (resApps && Array.isArray(resApps) && resApps.length > 0) {
          setApps(resApps);
          localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(resApps));
        }
        if (resProjects && Array.isArray(resProjects) && resProjects.length > 0) {
          setProjects(resProjects);
          localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(resProjects));
        }
        if (resSettings && resSettings.hero) {
          setSiteSettings(resSettings);
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(resSettings));
        }
      } catch (e) {
        console.warn('Operando con datos de respaldo local:', e);
      }
    };
    fetchRemoteData();
  }, []);

  // Modals & UI helpers
  const [editingApp, setEditingApp] = useState(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appModalTab, setAppModalTab] = useState('form'); // 'form' | 'json'
  const [appRawJsonText, setAppRawJsonText] = useState('');
  const [appRawJsonError, setAppRawJsonError] = useState('');
  const appsFileInputRef = React.useRef(null);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [selectedProjectTemplate, setSelectedProjectTemplate] = useState(null);

  const [editingProject, setEditingProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportDataString, setExportDataString] = useState('');
  const [exportDataType, setExportDataType] = useState('full'); // 'full' | 'apps' | 'projects' | 'settings'
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importError, setImportError] = useState('');
  const importFileInputRef = React.useRef(null);
  const [copiedExport, setCopiedExport] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState('');

  // --- STATE 5: Edge API Gateway Console (Admin Only) ---
  const [apiEndpoint, setApiEndpoint] = useState('status');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiLatency, setApiLatency] = useState(null);
  const [apiIncludeAuth, setApiIncludeAuth] = useState(true);
  const [copiedApiResponse, setCopiedApiResponse] = useState(false);

  const executeApiRequest = async (endpoint = apiEndpoint) => {
    setApiLoading(true);
    const start = performance.now();
    try {
      const targetUrl = `/api/v1/${endpoint}`;
      const options = {
        cache: 'no-store',
        headers: {}
      };
      if (apiIncludeAuth) {
        options.headers['Authorization'] = `Bearer ${passwordInput || DEFAULT_PASS}`;
        options.headers['x-admin-key'] = passwordInput || DEFAULT_PASS;
      }

      if (endpoint === 'auth') {
        options.method = 'POST';
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify({
          apiKey: passwordInput || DEFAULT_PASS,
          clientApp: 'KyrnForgeModConsole',
          timestamp: new Date().toISOString()
        });
      } else {
        options.method = 'GET';
      }

      const res = await fetch(targetUrl, options);
      const data = await res.json().catch(err => ({ error: "Respuesta no JSON", details: err.message }));
      setApiLatency(Math.round(performance.now() - start));
      setApiResponse({
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        headers: {
          contentType: res.headers.get('content-type') || 'application/json',
          cfRay: res.headers.get('cf-ray') || 'Local Dev'
        },
        data
      });
    } catch (err) {
      setApiLatency(Math.round(performance.now() - start));
      setApiResponse({
        status: 500,
        statusText: 'Network / Edge Failure',
        data: { error: err.message }
      });
    } finally {
      setApiLoading(false);
    }
  };

  const handleImportFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setImportJsonInput(text);
          setImportError('');
        }
      } catch (err) {
        setImportError('Error leyendo el archivo: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Check Database connection (Cloudflare KV or External DB)
  const refreshDbStatus = async () => {
    try {
      const res = await fetch(`/api/v1/content?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.database && data.database.connected) {
          setDbStatus(data.database);
          showToast(`✓ Base de Datos Conectada: ${data.database.type}`);
          return;
        }
      }
    } catch {
      // ignore
    }
    if (customDbUrl) {
      setDbStatus({ connected: true, type: 'Base de Datos Externa' });
      showToast('✓ Conectado a Base de Datos Externa');
    } else {
      setDbStatus({ connected: false, type: 'none' });
      showToast('ℹ Base de Datos Cloudflare KV no vinculada aún');
    }
  };

  // Persist Apps to Database (Cloudflare KV or External DB) and local storage
  const saveApps = async (newApps) => {
    setApps(newApps);
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(newApps, null, 2));
    setIsSavingDb(true);

    let savedToExternal = false;
    if (customDbUrl) {
      try {
        const cleanUrl = customDbUrl.replace(/\/$/, '');
        const target = cleanUrl.endsWith('.json') ? cleanUrl : `${cleanUrl}/apps.json`;
        await fetch(target, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newApps)
        });
        savedToExternal = true;
      } catch (err) {
        console.warn("Error guardando en base de datos externa:", err);
      }
    }

    try {
      const auth = localStorage.getItem('kyrnforge_auth_token') || passwordInput || (localStorage.getItem(AUTH_KEY) === 'true' ? 'kyrnforge2026' : DEFAULT_PASS);
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
        if (data.source === 'cloudflare-kv') {
          setDbStatus({ connected: true, type: 'Cloudflare KV' });
          showToast('✓ ¡Guardado en la Base de Datos en la Nube (Cloudflare KV)! Visible en todos los dispositivos.');
          setIsSavingDb(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API de servidor no disponible o modo estático:", err);
    } finally {
      setIsSavingDb(false);
    }

    if (savedToExternal) {
      showToast('✓ ¡Guardado en la Base de Datos en la Nube! Sincronizado en todos los dispositivos.');
    } else {
      showToast('✓ Apps guardadas localmente. (Vincula Cloudflare KV para que se sincronice en todos los dispositivos).');
    }
  };

  // Persist Projects to both Backend API and localStorage
  const saveProjects = async (newProjects) => {
    setProjects(newProjects);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(newProjects, null, 2));

    try {
      const auth = localStorage.getItem('kyrnforge_auth_token') || passwordInput || (localStorage.getItem(AUTH_KEY) === 'true' ? 'kyrnforge2026' : DEFAULT_PASS);
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
        if (data.source === 'cloudflare-kv') {
          showToast('✓ Proyectos guardados permanentemente en Cloudflare KV (Nube)');
        } else {
          showToast('✓ Proyectos guardados en public/data/projects.json. Ejecuta deploy.bat para publicar.');
        }
        return;
      }
    } catch (err) {
      console.warn("API de servidor no disponible o modo estático:", err);
    }
    showToast('✓ Proyectos actualizados en este navegador');
  };

  // Persist Site Settings to both Backend API and localStorage
  const saveSiteSettings = async (newSettings) => {
    setSiteSettings(newSettings);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings, null, 2));

    try {
      const auth = localStorage.getItem('kyrnforge_auth_token') || passwordInput || (localStorage.getItem(AUTH_KEY) === 'true' ? 'kyrnforge2026' : DEFAULT_PASS);
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
        if (data.source === 'cloudflare-kv') {
          showToast('✓ Configuración guardada en Cloudflare KV (Nube)');
        } else {
          showToast('✓ Configuración guardada en public/data/settings.json. Ejecuta deploy.bat para publicar.');
        }
        return;
      }
    } catch (err) {
      console.warn("API de servidor no disponible o modo estático:", err);
    }
    showToast('✓ Configuración actualizada en este navegador');
  };

  // Persist Full Backup (Apps, Projects, and SiteSettings) to Cloudflare KV and localStorage
  const saveFullBackup = async (fullData) => {
    const newApps = fullData.availableApps;
    const newProjects = fullData.projects;
    const newSettings = fullData.siteSettings;

    if (newApps && Array.isArray(newApps)) {
      setApps(newApps);
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(newApps, null, 2));
    }
    if (newProjects && Array.isArray(newProjects)) {
      setProjects(newProjects);
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(newProjects, null, 2));
    }
    if (newSettings && (newSettings.hero || newSettings.metrics)) {
      setSiteSettings(newSettings);
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings, null, 2));
    }

    try {
      const auth = localStorage.getItem('kyrnforge_auth_token') || passwordInput || (localStorage.getItem(AUTH_KEY) === 'true' ? 'kyrnforge2026' : DEFAULT_PASS);
      const res = await fetch('/api/v1/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        body: JSON.stringify({
          availableApps: newApps || apps,
          projects: newProjects || projects,
          siteSettings: newSettings || siteSettings
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data && data.success) {
        showToast('✓ Respaldo total guardado en Cloudflare KV (Nube)');
        return true;
      }
    } catch (err) {
      console.warn("Error enviando respaldo completo a la API:", err);
    }
    showToast('✓ Respaldo aplicado en el navegador local');
    return false;
  };

  const showToast = (msg) => {
    setSaveSuccessToast(msg);
    setTimeout(() => setSaveSuccessToast(''), 3500);
  };

  // Auth Handlers
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const enteredPass = passwordInput.trim();
    if (!enteredPass) return;
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: enteredPass })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAuthError(false);
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem('kyrnforge_auth_token', enteredPass);
        setIsLoggingIn(false);
        return;
      }
    } catch {
      // Local fallback for offline/development
      if (enteredPass === DEFAULT_PASS) {
        setIsAuthenticated(true);
        setAuthError(false);
        localStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem('kyrnforge_auth_token', enteredPass);
        setIsLoggingIn(false);
        return;
      }
    }
    setIsLoggingIn(false);
    setAuthError(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('kyrnforge_auth_token');
    setPasswordInput('');
  };

  // --- APP CRUD OPERATIONS ---
  const handleApplyProjectTemplate = (project) => {
    if (!project) return;
    
    // Auto-map tags to feature objects with smart icons
    let mappedFeatures = [];
    if (project.tags) {
      const tagList = Array.isArray(project.tags) ? project.tags : String(project.tags).split('·').map(t => t.trim());
      mappedFeatures = tagList.map(tagText => {
        const lower = tagText.toLowerCase();
        let iconName = 'Zap';
        let color = 'text-cyan-400';
        if (lower.includes('vault') || lower.includes('bóveda') || lower.includes('segur') || lower.includes('legal') || lower.includes('verific')) {
          iconName = 'Shield';
          color = 'text-emerald-400';
        } else if (lower.includes('server') || lower.includes('runtime') || lower.includes('local') || lower.includes('micro') || lower.includes('dynexpress')) {
          iconName = 'Server';
          color = 'text-purple-400';
        } else if (lower.includes('game') || lower.includes('launcher') || lower.includes('deck') || lower.includes('tienda')) {
          iconName = 'Gamepad2';
          color = 'text-amber-400';
        } else if (lower.includes('compress') || lower.includes('brotli') || lower.includes('package') || lower.includes('pack')) {
          iconName = 'Package';
          color = 'text-cyan-400';
        } else if (lower.includes('cli') || lower.includes('terminal') || lower.includes('demonio')) {
          iconName = 'Terminal';
          color = 'text-emerald-400';
        } else if (lower.includes('cpu') || lower.includes('motor') || lower.includes('render') || lower.includes('engine')) {
          iconName = 'Cpu';
          color = 'text-cyan-400';
        }
        return { label: tagText, description: '', iconName, color };
      });
    }

    // Determine colors based on badgeColor or project
    const badgeColor = project.badgeColor || 'border-cyan-500/30 bg-cyan-950/40 text-cyan-400';
    let themeBorder = 'border-cyan-500/40';
    let themeGlow = 'shadow-cyan-500/20';
    let glowClass = 'glow-cyan';
    let btnBg = 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-500/25';
    let accentText = 'text-cyan-400';

    if (badgeColor.includes('purple')) {
      themeBorder = 'border-purple-500/40';
      themeGlow = 'shadow-purple-500/20';
      glowClass = 'glow-purple';
      btnBg = 'bg-purple-500 hover:bg-purple-400 text-zinc-950 shadow-purple-500/25';
      accentText = 'text-purple-400';
    } else if (badgeColor.includes('amber')) {
      themeBorder = 'border-amber-500/40';
      themeGlow = 'shadow-amber-500/20';
      glowClass = 'glow-amber';
      btnBg = 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/25';
      accentText = 'text-amber-400';
    } else if (badgeColor.includes('emerald')) {
      themeBorder = 'border-emerald-500/40';
      themeGlow = 'shadow-emerald-500/20';
      glowClass = 'glow-emerald';
      btnBg = 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25';
      accentText = 'text-emerald-400';
    }

    const nextTag = String(apps.length + 1).padStart(2, '0');
    const cleanShortName = project.title
      .replace(/\(.*?\)/g, '')
      .replace(/Platform|Launcher|Studio|Utility|Engine/gi, '')
      .trim() || project.title;

    const populatedApp = {
      ...(editingApp || {}),
      id: project.id || `app-${Date.now().toString(36)}`,
      tag: editingApp?.tag || nextTag,
      title: project.title,
      shortName: cleanShortName,
      badge: project.statusLabel || project.version || 'v1.0.0 Oficial',
      badgeColor: badgeColor,
      category: project.categoryLabel || project.category || 'Software Nativo',
      system: 'Windows 10/11 (64-bit) · Instalador Oficial',
      iconImg: project.iconImg || '/projects/default-app.svg',
      iconScale: '',
      themeBorder: themeBorder,
      themeGlow: themeGlow,
      glowClass: glowClass,
      btnBg: btnBg,
      accentText: accentText,
      description: project.description,
      features: mappedFeatures.length > 0 ? mappedFeatures : (editingApp?.features || []),
      downloadUrl: project.downloadUrl || 'https://github.com/devlwte',
      downloadLabel: project.downloadUrl ? 'DESCARGAR SETUP (.EXE)' : 'DESCARGAR SETUP (.ZIP)',
      repoUrl: project.repoUrl || 'https://github.com/devlwte',
      metaInfo: project.tags && Array.isArray(project.tags) 
        ? project.tags.slice(0, 2).join(' · ') 
        : 'Verificación SHA-256 · Freeware Legal'
    };

    setEditingApp(populatedApp);
    setAppRawJsonText(JSON.stringify(populatedApp, null, 2));
    setSelectedProjectTemplate(project);
    setIsProjectDropdownOpen(false);
    setProjectSearchQuery('');
    showToast(`✓ Datos cargados desde el proyecto "${project.title}"`);
  };

  const handlePromoteProjectToApp = (project) => {
    handleOpenAddApp();
    handleApplyProjectTemplate(project);
    setActiveTab('apps');
  };

  const handleOpenAddApp = () => {
    setSelectedProjectTemplate(null);
    setProjectSearchQuery('');
    setIsProjectDropdownOpen(false);
    const nextTag = String(apps.length + 1).padStart(2, '0');
    const newApp = {
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
        { label: 'Característica 1', description: '', iconName: 'Shield', color: 'text-cyan-400' },
        { label: 'Característica 2', description: '', iconName: 'Zap', color: 'text-emerald-400' },
        { label: 'Característica 3', description: '', iconName: 'Cpu', color: 'text-purple-400' }
      ],
      downloadUrl: 'https://github.com/devlwte',
      downloadLabel: 'DESCARGAR SETUP (.ZIP)',
      repoUrl: 'https://github.com/devlwte',
      metaInfo: 'Verificación SHA-256 · Freeware Legal'
    };
    setEditingApp(newApp);
    setAppRawJsonText(JSON.stringify(newApp, null, 2));
    setAppRawJsonError('');
    setAppModalTab('form');
    setIsAppModalOpen(true);
  };

  const handleOpenEditApp = (app) => {
    setSelectedProjectTemplate(null);
    setProjectSearchQuery('');
    setIsProjectDropdownOpen(false);
    const clone = JSON.parse(JSON.stringify(app));
    if (!Array.isArray(clone.features)) clone.features = [];
    setEditingApp(clone);
    setAppRawJsonText(JSON.stringify(clone, null, 2));
    setAppRawJsonError('');
    setAppModalTab('form');
    setIsAppModalOpen(true);
  };

  const handleDuplicateApp = (app) => {
    const clone = JSON.parse(JSON.stringify(app));
    clone.id = `${app.id}-copia-${Date.now().toString(36).slice(-4)}`;
    clone.shortName = `${app.shortName} (Copia)`;
    clone.title = `${app.title} (Copia)`;
    const updated = [...apps, clone].map((a, i) => ({
      ...a,
      tag: String(i + 1).padStart(2, '0')
    }));
    saveApps(updated);
    showToast(`✓ Aplicación "${app.shortName}" duplicada`);
  };

  const handleAddFeature = () => {
    if (!editingApp) return;
    const currentFeatures = Array.isArray(editingApp.features) ? editingApp.features : [];
    const updatedFeatures = [
      ...currentFeatures,
      { label: 'Nueva Característica', description: '', iconName: 'Zap', color: 'text-cyan-400' }
    ];
    const updatedApp = { ...editingApp, features: updatedFeatures };
    setEditingApp(updatedApp);
    setAppRawJsonText(JSON.stringify(updatedApp, null, 2));
  };

  const handleUpdateFeature = (index, field, value) => {
    if (!editingApp || !Array.isArray(editingApp.features)) return;
    const updated = [...editingApp.features];
    updated[index] = { ...updated[index], [field]: value };
    const updatedApp = { ...editingApp, features: updated };
    setEditingApp(updatedApp);
    setAppRawJsonText(JSON.stringify(updatedApp, null, 2));
  };

  const handleRemoveFeature = (index) => {
    if (!editingApp || !Array.isArray(editingApp.features)) return;
    const updated = editingApp.features.filter((_, i) => i !== index);
    const updatedApp = { ...editingApp, features: updated };
    setEditingApp(updatedApp);
    setAppRawJsonText(JSON.stringify(updatedApp, null, 2));
  };

  const handleDownloadAppsJson = () => {
    const blob = new Blob([JSON.stringify(apps, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apps.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ Archivo apps.json descargado a tu equipo');
  };

  const handleUploadAppsJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const reindexed = parsed.map((a, i) => ({
            ...a,
            tag: String(i + 1).padStart(2, '0')
          }));
          saveApps(reindexed);
          showToast(`✓ Archivo ${file.name} importado: ${reindexed.length} apps cargadas`);
        } else {
          alert('El archivo JSON debe contener un arreglo de aplicaciones.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleSaveAppForm = (e) => {
    e.preventDefault();
    let appToSave = editingApp;

    if (appModalTab === 'json') {
      try {
        const parsed = JSON.parse(appRawJsonText);
        if (!parsed.id || !parsed.title) {
          setAppRawJsonError('El JSON debe contener al menos los campos "id" y "title".');
          return;
        }
        appToSave = parsed;
      } catch (err) {
        setAppRawJsonError(`Error de sintaxis JSON: ${err.message}`);
        return;
      }
    }

    if (!appToSave.id || !appToSave.title) return;

    const exists = apps.some(a => a.id === appToSave.id);
    let updated;
    if (exists) {
      updated = apps.map(a => a.id === appToSave.id ? appToSave : a);
    } else {
      updated = [...apps, appToSave];
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
        source: 'kyrnforge-kv-backup',
        availableApps: apps,
        projects,
        siteSettings
      };
    } else if (type === 'apps') {
      data = apps;
    } else if (type === 'projects') {
      data = projects;
    } else if (type === 'settings' || type === 'hero') {
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
    const dateStr = new Date().toISOString().slice(0, 10);
    let filename;
    if (exportDataType === 'full') {
      filename = `kyrnforge_complete_backup_${dateStr}.json`;
    } else if (exportDataType === 'hero' || exportDataType === 'settings') {
      filename = `kyrnforge_portada_metricas_${dateStr}.json`;
    } else if (exportDataType === 'apps') {
      filename = `kyrnforge_apps_${dateStr}.json`;
    } else if (exportDataType === 'projects') {
      filename = `kyrnforge_proyectos_${dateStr}.json`;
    } else {
      filename = `kyrnforge_${exportDataType}_${dateStr}.json`;
    }
    const blob = new Blob([exportDataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setImportError('');
    try {
      const parsed = JSON.parse(importJsonInput);
      
      // 1. Full Backup (contains siteSettings and/or availableApps and/or projects)
      if (parsed.siteSettings || (parsed.availableApps && parsed.projects)) {
        await saveFullBackup({
          availableApps: parsed.availableApps || apps,
          projects: parsed.projects || projects,
          siteSettings: parsed.siteSettings || siteSettings
        });
        showToast("✓ Copia de seguridad completa (Apps, Proyectos, Portada y Métricas) restaurada en Cloudflare KV.");
      } else if (parsed.availableApps && !parsed.projects) {
        await saveApps(parsed.availableApps);
        showToast("✓ Aplicaciones del carrusel restauradas en Cloudflare KV.");
      } else if (parsed.projects && !parsed.availableApps) {
        await saveProjects(parsed.projects);
        showToast("✓ Catálogo de proyectos restaurado en Cloudflare KV.");
      } else if (parsed.hero || parsed.metrics) {
        // Portada y Métricas directly
        const mergedSettings = {
          hero: parsed.hero || siteSettings.hero,
          metrics: parsed.metrics || siteSettings.metrics
        };
        await saveSiteSettings(mergedSettings);
        showToast("✓ Portada y Métricas restauradas con éxito en Cloudflare KV.");
      } else if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          throw new Error("El archivo JSON está vacío.");
        }
        if (parsed[0]?.downloadLabel !== undefined || parsed[0]?.glowClass !== undefined || parsed[0]?.metaInfo !== undefined) {
          await saveApps(parsed);
          showToast("✓ Aplicaciones del carrusel restauradas en Cloudflare KV.");
        } else {
          await saveProjects(parsed);
          showToast("✓ Catálogo de proyectos restaurado en Cloudflare KV.");
        }
      } else {
        throw new Error("Estructura JSON no reconocida. Asegúrate de subir o pegar un archivo de respaldo válido.");
      }
      setIsImportModalOpen(false);
      setImportJsonInput('');
    } catch (err) {
      setImportError(err.message || 'El JSON ingresado no es válido.');
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
                  <span>Contraseña incorrecta. Revisa tu contraseña de administrador o usa la clave predeterminada.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95 ${isLoggingIn ? 'opacity-70 cursor-wait' : ''}`}
            >
              <Unlock className={`w-4 h-4 ${isLoggingIn ? 'animate-spin' : ''}`} />
              <span>{isLoggingIn ? 'VERIFICANDO CREDENCIALES...' : 'INGRESAR AL PANEL'}</span>
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
          <div className="max-w-6xl mx-auto px-3 sm:px-6 flex items-center overflow-x-auto no-scrollbar space-x-2 py-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab('apps')}
              className={`px-3 sm:px-3.5 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'apps'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Download className="w-3.5 h-3.5 flex-shrink-0" />
              <span><span className="hidden sm:inline">1. Carrusel Descargas</span><span className="sm:hidden">1. Apps</span> ({apps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 sm:px-3.5 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'projects'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span><span className="hidden sm:inline">2. Línea de Proyectos</span><span className="sm:hidden">2. Proyectos</span> ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('hero')}
              className={`px-3 sm:px-3.5 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'hero'
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 flex-shrink-0" />
              <span><span className="hidden sm:inline">3. Portada & Métricas</span><span className="sm:hidden">3. Portada</span></span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3 sm:px-3.5 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'backup'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 flex-shrink-0" />
              <span><span className="hidden sm:inline">4. Respaldo & Exportación</span><span className="sm:hidden">4. Respaldo</span></span>
            </button>

            <button
              onClick={() => {
                setActiveTab('api');
                if (!apiResponse) executeApiRequest('status');
              }}
              className={`px-3 sm:px-3.5 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'api'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
              <span><span className="hidden sm:inline">5. Consola API Edge</span><span className="sm:hidden">5. API</span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Cloud Database Status Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition shadow-sm ${
          dbStatus.connected 
            ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300' 
            : 'bg-[#0c0e17] border-amber-500/40 text-zinc-300'
        }`}>
          <div className="flex items-start sm:items-center space-x-3">
            <div className={`w-3 h-3 rounded-full mt-1 sm:mt-0 flex-shrink-0 animate-pulse ${
              dbStatus.connected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-amber-400 shadow-lg shadow-amber-400/50'
            }`} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-100">
                  {dbStatus.connected ? `Base de Datos en la Nube: ${dbStatus.type}` : 'Base de Datos: Modo Local (Sin Vincular a la Nube)'}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  dbStatus.connected 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {dbStatus.connected ? 'ACTIVA Y EN VIVO' : 'PENDIENTE DE ACTIVAR'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {dbStatus.connected 
                  ? 'Todos los cambios que guardes se sincronizan al instante en todos los dispositivos (móvil, tablet, PC) a través de la base de datos.' 
                  : 'Para que los cambios se guarden en la base de datos y aparezcan en todos los celulares y PCs al instante, vincula la base de datos KV gratuita en Cloudflare.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-center">
            {!dbStatus.connected && (
              <button
                type="button"
                onClick={() => setShowDbGuide(!showDbGuide)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition flex items-center space-x-1.5"
              >
                <Server className="w-3.5 h-3.5" />
                <span>{showDbGuide ? 'Ocultar Guía' : 'Activar Base de Datos'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={refreshDbStatus}
              title="Comprobar estado de conexión con la base de datos"
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Verificar</span>
            </button>
          </div>
        </div>

        {/* Expandable 1-Minute Guide for Cloudflare KV & External DB */}
        {showDbGuide && !dbStatus.connected && (
          <div className="mt-3 p-4 sm:p-5 rounded-xl bg-[#090b10] border border-amber-500/30 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-zinc-100 font-mono">
                  Cómo conectar la Base de Datos Gratuita en Cloudflare (3 Clics rápidos)
                </h4>
              </div>
              <button 
                onClick={() => setShowDbGuide(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-mono"
              >
                ✕ Cerrar
              </button>
            </div>

            <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside font-mono">
              <li>
                Inicia sesión en <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">dash.cloudflare.com</a>.
              </li>
              <li>
                En el menú de la izquierda ve a <b>Storage & Databases</b> &gt; <b>KV</b> &gt; Clic en <b>Create a namespace</b> y nómbralo: <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300 font-bold">KYRNFORGE_KV</span>.
              </li>
              <li>
                Ve a <b>Workers & Pages</b> &gt; Clic en tu proyecto <b>kyrnforge</b> &gt; Pestaña <b>Settings</b> &gt; <b>Functions</b>.
              </li>
              <li>
                Baja hasta la sección <b>KV namespace bindings</b> &gt; Clic en <b>Add binding</b>:
                <div className="mt-1 pl-4 space-y-0.5 text-zinc-400">
                  <div>• Variable name: <span className="text-emerald-400 font-bold">KYRNFORGE_KV</span></div>
                  <div>• KV namespace: Selecciona el namespace que creaste (<span className="text-emerald-400">KYRNFORGE_KV</span>)</div>
                </div>
              </li>
              <li>
                Guarda los cambios. ¡Listo! Vuelve aquí y haz clic en "Verificar". Cada vez que guardes una app, se guardará en la nube y se verá en todos los dispositivos al instante.
              </li>
            </ol>

            {/* Alternative: External Database URL (Firebase / Supabase) */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <span className="text-xs font-mono text-zinc-400 font-bold block">
                Opción alternativa: Conectar URL de Base de Datos Externa (Firebase Realtime Database)
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customDbUrl}
                  onChange={(e) => setCustomDbUrl(e.target.value)}
                  placeholder="https://tu-proyecto-default-rtdb.firebaseio.com"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('kyrnforge_custom_db_url', customDbUrl.trim());
                    refreshDbStatus();
                    showToast('✓ URL de Base de Datos guardada');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition active:scale-95"
                >
                  Conectar URL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

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
                  Modifica cualquier dato de las aplicaciones. Al guardar, los cambios se envían directamente a la base de datos en la nube.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
                  type="file"
                  ref={appsFileInputRef}
                  onChange={handleUploadAppsJson}
                  accept=".json"
                  className="hidden"
                />

                <button
                  onClick={handleOpenAddApp}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>NUEVA APP</span>
                </button>

                <button
                  onClick={() => saveApps(apps)}
                  disabled={isSavingDb}
                  title="Guardar todos los cambios en la base de datos en la nube"
                  className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-bold transition flex items-center justify-center space-x-1.5 active:scale-95 ${
                    isSavingDb 
                      ? 'bg-zinc-800 text-zinc-400 border-zinc-700 cursor-wait' 
                      : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  <Save className={`w-3.5 h-3.5 ${isSavingDb ? 'animate-spin' : ''}`} />
                  <span>{isSavingDb ? 'Guardando...' : 'GUARDAR BD'}</span>
                </button>

                <button
                  onClick={handleDownloadAppsJson}
                  title="Descargar el archivo apps.json a tu equipo"
                  className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>

                <button
                  onClick={() => appsFileInputRef.current?.click()}
                  title="Cargar un archivo apps.json desde tu computadora"
                  className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-purple-400 hover:text-purple-300 transition flex items-center justify-center space-x-1.5"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Importar</span>
                </button>

                <button
                  onClick={() => openExportModal('apps')}
                  className="col-span-2 sm:col-span-1 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition flex items-center justify-center space-x-1.5"
                >
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ver JSON</span>
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

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-zinc-800/60 md:border-t-0 md:pt-0 w-full md:w-auto">
                    <button
                      onClick={() => handleDuplicateApp(app)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition flex items-center space-x-1.5"
                      title="Duplicar esta aplicación como plantilla"
                    >
                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Clonar</span>
                    </button>
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

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenAddProject}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>NUEVO PROYECTO</span>
                </button>
                <button
                  onClick={() => openExportModal('projects')}
                  className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition flex items-center justify-center space-x-1.5"
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

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-zinc-800/60 md:border-t-0 md:pt-0 w-full md:w-auto">
                    <button
                      onClick={() => handlePromoteProjectToApp(proj)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition flex items-center space-x-1.5 shadow-sm active:scale-95"
                      title="Abrir como nueva app en el carrusel con todos sus datos ya autorellenados"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>+ Al Carrusel</span>
                    </button>
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

              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => openExportModal('full')}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
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
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition flex items-center justify-center space-x-1.5"
                >
                  <FileUp className="w-4 h-4 text-cyan-400" />
                  <span>Restaurar / Importar</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Grid - 4 Dedicated Backup Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Full Backup */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#080a10] border border-emerald-500/30 space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>SITIO COMPLETO</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-bold">100% KV</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100">Respaldo Integral</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Apps del carrusel, catálogo de proyectos, lemas de portada y las 4 métricas en un único archivo.
                  </p>
                </div>
                <button
                  onClick={() => openExportModal('full')}
                  className="w-full py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono text-emerald-300 transition flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Descargar Todo (.json)</span>
                </button>
              </div>

              {/* Card 2: Portada Hero & Metrics */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#080a10] border border-purple-500/30 space-y-3 flex flex-col justify-between hover:border-purple-500/50 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-purple-400">
                    <span className="flex items-center space-x-1.5">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>PORTADA & MÉTRICAS</span>
                    </span>
                    <span className="text-zinc-500">4 métricas</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100">Portada y Métricas</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Lemas principales, título H1, párrafos, botones y valores de las 4 tarjetas del portal.
                  </p>
                </div>
                <button
                  onClick={() => openExportModal('hero')}
                  className="w-full py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-xs font-mono text-purple-300 transition flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Exportar Portada (.json)</span>
                </button>
              </div>

              {/* Card 3: Apps Carousel Backup */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#080a10] border border-cyan-500/30 space-y-3 flex flex-col justify-between hover:border-cyan-500/50 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span className="flex items-center space-x-1.5">
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>CARRUSEL APPS</span>
                    </span>
                    <span className="text-zinc-500">{apps.length} items</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100">Aplicaciones</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Objetos de software para descarga con enlaces de instalación, tags y temas visuales.
                  </p>
                </div>
                <button
                  onClick={() => openExportModal('apps')}
                  className="w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-xs font-mono text-cyan-300 transition flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Exportar Apps (.json)</span>
                </button>
              </div>

              {/* Card 4: Projects Catalog Backup */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#080a10] border border-amber-500/30 space-y-3 flex flex-col justify-between hover:border-amber-500/50 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                    <span className="flex items-center space-x-1.5">
                      <Gamepad2 className="w-4 h-4 text-amber-400" />
                      <span>PROYECTOS & JUEGOS</span>
                    </span>
                    <span className="text-zinc-500">{projects.length} items</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100">Catálogo Proyectos</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Lista de proyectos, motores y videojuegos en desarrollo con sus estados y tags.
                  </p>
                </div>
                <button
                  onClick={() => openExportModal('projects')}
                  className="w-full py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-xs font-mono text-amber-300 transition flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Exportar Proyectos (.json)</span>
                </button>
              </div>

            </div>

            {/* Cloudflare KV Persistence & Privacy Notice */}
            <div className="p-5 rounded-xl bg-[#07090e] border border-zinc-800/80 space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Base de Datos Cloudflare KV en la Nube · Privacidad y Persistencia Total</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Todo el contenido modificado en este panel (aplicaciones del carrusel, catálogo de proyectos, textos de portada y métricas) se sincroniza directamente con la base de datos distribuida <b>Cloudflare KV</b>. El repositorio de Git permanece libre de datos hardcodeados, garantizando que tus modificaciones sean privadas, instantáneas y sin necesidad de compilar código.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-zinc-300">
                <div className="flex items-start space-x-2.5 bg-[#050608] p-3 rounded-lg border border-zinc-800/80">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-zinc-100 block">Sin datos privados en GitHub</strong>
                    <span className="text-[11px] text-zinc-500">El repositorio de código fuente permanece limpio. Nadie en GitHub puede ver ni alterar tus aplicaciones.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5 bg-[#050608] p-3 rounded-lg border border-zinc-800/80">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-zinc-100 block">Sincronización en Tiempo Real</strong>
                    <span className="text-[11px] text-zinc-500">Cada cambio o respaldo restaurado se refleja al instante en todos los celulares y computadoras del mundo.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: API GATEWAY CONSOLE & EDGE DIAGNOSTICS (ADMIN / MOD ONLY)          */}
        {/* ========================================================================= */}
        {activeTab === 'api' && (
          <section className="space-y-6 animate-fadeIn">
            {/* Action Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0a0c12] border border-cyan-500/30">
              <div>
                <div className="text-xs font-mono text-cyan-400 flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>HERRAMIENTA PRIVADA · CONSOLA SERVERLESS EDGE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-0.5">
                  Diagnóstico y Pruebas de API en Tiempo Real
                </h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Prueba de forma segura los endpoints de Cloudflare Functions que dan servicio al ecosistema y a las aplicaciones de escritorio.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => executeApiRequest(apiEndpoint)}
                  disabled={apiLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${apiLoading ? 'animate-spin' : ''}`} />
                  <span>{apiLoading ? 'CONSULTANDO...' : 'EJECUTAR PETICIÓN'}</span>
                </button>
              </div>
            </div>

            {/* Console Control Panel */}
            <div className="bg-[#090b10] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 font-mono">
              {/* Endpoint Selector Tabs */}
              <div className="space-y-2">
                <span className="text-xs text-zinc-400 font-bold block">1. SELECCIONA EL ENDPOINT A EVALUAR:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'status', method: 'GET', label: '/api/v1/status (Estado Global & Uptime)' },
                    { id: 'health', method: 'GET', label: '/api/v1/health (Healthcheck Worker)' },
                    { id: 'content', method: 'GET', label: '/api/v1/content (Inspección Cloudflare KV)' },
                    { id: 'apps', method: 'GET', label: '/api/v1/apps (Catálogo de Apps JSON)' },
                    { id: 'auth', method: 'POST', label: '/api/v1/auth (Test Token Autenticación)' }
                  ].map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => {
                        setApiEndpoint(ep.id);
                        executeApiRequest(ep.id);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-2 border ${
                        apiEndpoint === ep.id
                          ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/50 shadow-sm'
                          : 'bg-[#06080d] text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-800'
                      }`}
                    >
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        ep.method === 'POST' ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {ep.method}
                      </span>
                      <span>{ep.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security & Authorization Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#06080d] border border-zinc-900 text-xs">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none text-zinc-300">
                  <input
                    type="checkbox"
                    checked={apiIncludeAuth}
                    onChange={(e) => setApiIncludeAuth(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Incluir cabeceras de autorización de Administrador (<code>Authorization: Bearer</code>)</span>
                </label>

                <div className="flex items-center space-x-2 text-[11px] text-zinc-500">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Clave en uso: <strong className="text-zinc-300">ADMINISTRADOR ACTIVO</strong></span>
                </div>
              </div>

              {/* URL Display */}
              <div className="flex items-center space-x-2.5 text-xs text-zinc-400 bg-[#050608] px-3.5 py-2.5 rounded-xl border border-zinc-900 overflow-x-auto">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  apiEndpoint === 'auth' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {apiEndpoint === 'auth' ? 'POST' : 'GET'}
                </span>
                <span className="text-zinc-200 truncate font-bold">
                  https://kyrnforge.dev/api/v1/{apiEndpoint}
                </span>
              </div>

              {/* Terminal Window */}
              <div className="bg-[#030406] border border-zinc-900 rounded-xl p-4 sm:p-5 text-xs overflow-hidden flex flex-col justify-between space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900/90 pb-3 text-[11px]">
                  <div className="flex items-center space-x-3">
                    {apiResponse ? (
                      <span className={`flex items-center space-x-1.5 font-bold ${
                        apiResponse.status >= 200 && apiResponse.status < 300 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>HTTP {apiResponse.status} {apiResponse.statusText}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500 flex items-center space-x-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Esperando ejecución...</span>
                      </span>
                    )}

                    {apiLatency !== null && (
                      <span className="text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                        Latencia Edge: {apiLatency} ms
                      </span>
                    )}

                    {apiResponse?.headers?.cfRay && (
                      <span className="text-zinc-500 hidden md:inline">
                        CF-Ray: {apiResponse.headers.cfRay}
                      </span>
                    )}
                  </div>

                  {apiResponse && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(apiResponse.data || apiResponse, null, 2));
                        setCopiedApiResponse(true);
                        setTimeout(() => setCopiedApiResponse(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] font-mono transition flex items-center space-x-1.5"
                    >
                      {copiedApiResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                      <span>{copiedApiResponse ? '¡Copiado!' : 'Copiar JSON'}</span>
                    </button>
                  )}
                </div>

                <div className="min-h-[220px] max-h-[460px] overflow-auto modal-scroll rounded-lg bg-[#010204] p-3.5 border border-zinc-900/70">
                  {apiResponse ? (
                    <pre className="text-emerald-400 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                      {JSON.stringify(apiResponse.data || apiResponse, null, 2)}
                    </pre>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-zinc-600 space-y-2 text-center">
                      <Terminal className="w-8 h-8 text-zinc-700" />
                      <span>Haz clic en "EJECUTAR PETICIÓN" o selecciona cualquier endpoint para inspeccionar la respuesta serverless.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT APP (TOTAL CONTROL: FORM & RAW JSON)                    */}
      {/* ========================================================================= */}
      {isAppModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-[#0c0e17] border border-zinc-800/90 rounded-2xl w-full max-w-3xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* Pinned Fixed Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3.5 sm:px-6 sm:py-4 flex-shrink-0 bg-[#0a0c14] gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <Download className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 truncate">
                  {apps.some(a => a.id === editingApp.id) ? 'Editar Aplicación' : 'Nueva Aplicación'}
                </h3>
              </div>

              {/* Mode Switcher: Visual Form vs Raw JSON */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="flex items-center space-x-1 bg-[#050608] p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      if (appModalTab === 'json') {
                        try {
                          const parsed = JSON.parse(appRawJsonText);
                          setEditingApp(parsed);
                          setAppRawJsonError('');
                        } catch (err) {
                          setAppRawJsonError('JSON inválido. Corrige la sintaxis antes de volver al formulario visual.');
                          return;
                        }
                      }
                      setAppModalTab('form');
                    }}
                    className={`px-2.5 sm:px-3 py-1 rounded transition text-xs ${appModalTab === 'form' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    Formulario
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAppRawJsonText(JSON.stringify(editingApp, null, 2));
                      setAppRawJsonError('');
                      setAppModalTab('json');
                    }}
                    className={`px-2.5 sm:px-3 py-1 rounded transition flex items-center space-x-1 text-xs ${appModalTab === 'json' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editor</span> JSON
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center font-mono text-sm transition"
                  title="Cerrar modal"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveAppForm} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto modal-scroll p-4 sm:p-6 space-y-4">
                {appModalTab === 'json' ? (
                  /* RAW JSON MODE: 100% UNRESTRICTED CONTROL */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#080b14] border border-cyan-500/30 text-xs font-mono text-cyan-300">
                      <div className="font-bold flex items-center space-x-1.5 pb-1">
                        <Code2 className="w-4 h-4 text-cyan-400" />
                        <span>CONTROL TOTAL DEL OBJETO JSON</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        Aquí puedes modificar directamente cualquier propiedad de la app, añadir nuevos campos o cambiar valores libremente. Al guardar se validará la sintaxis JSON.
                      </p>
                    </div>

                    {appRawJsonError && (
                      <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300">
                        ⚠️ {appRawJsonError}
                      </div>
                    )}

                    <textarea
                      rows={16}
                      value={appRawJsonText}
                      onChange={(e) => {
                        setAppRawJsonText(e.target.value);
                        setAppRawJsonError('');
                      }}
                      className="w-full bg-[#050608] border border-zinc-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500/50 modal-scroll"
                      spellCheck={false}
                    />
                  </div>
                ) : (
                /* VISUAL DETAILED FORM MODE */
                <>
                  {/* PROJECT TEMPLATE AUTOFILL SELECTOR */}
                  <div className="p-3.5 rounded-xl bg-[#070912] border border-cyan-500/30 space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Autorellenar desde un Proyecto del Catálogo</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {projects.length} proyectos disponibles
                      </span>
                    </div>

                    <div className="relative">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={projectSearchQuery}
                            onChange={(e) => {
                              setProjectSearchQuery(e.target.value);
                              setIsProjectDropdownOpen(true);
                            }}
                            onFocus={() => setIsProjectDropdownOpen(true)}
                            placeholder="Buscar proyecto para cargar datos (ej. PlayWarp, Kyrnex, GetGame)..."
                            className="w-full bg-[#050608] border border-zinc-800 focus:border-cyan-500/60 rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                          className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition flex items-center space-x-1"
                        >
                          <span>{isProjectDropdownOpen ? 'Cerrar' : 'Ver Lista'}</span>
                          <ArrowDown className={`w-3 h-3 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Dropdown list of projects */}
                      {isProjectDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-[#090b14] border border-zinc-700/80 rounded-xl shadow-2xl max-h-60 overflow-y-auto modal-scroll divide-y divide-zinc-800/60 animate-fadeIn">
                          {projects
                            .filter(p => {
                              if (!projectSearchQuery) return true;
                              const q = projectSearchQuery.toLowerCase();
                              return p.title.toLowerCase().includes(q) || 
                                     p.id.toLowerCase().includes(q) || 
                                     (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q));
                            })
                            .map(proj => (
                              <button
                                key={proj.id}
                                type="button"
                                onClick={() => handleApplyProjectTemplate(proj)}
                                className="w-full px-3.5 py-2.5 text-left hover:bg-cyan-950/30 flex items-center justify-between gap-3 transition group"
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-[#050608] border border-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    <img 
                                      src={proj.iconImg || '/projects/default-app.svg'} 
                                      alt={proj.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.src = "/projects/default-app.svg"; }}
                                    />
                                  </div>
                                  <div className="truncate">
                                    <div className="text-xs font-bold text-zinc-200 group-hover:text-cyan-300 truncate">
                                      {proj.title}
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-500 truncate">
                                      {proj.categoryLabel || proj.category}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${proj.badgeColor || 'border-zinc-800 text-zinc-400'}`}>
                                    {proj.statusLabel || proj.version}
                                  </span>
                                  <span className="text-xs font-mono text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                                    <span>Cargar</span>
                                    <span>→</span>
                                  </span>
                                </div>
                              </button>
                            ))}
                          {projects.filter(p => {
                            if (!projectSearchQuery) return true;
                            const q = projectSearchQuery.toLowerCase();
                            return p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
                          }).length === 0 && (
                            <div className="p-3 text-center text-xs font-mono text-zinc-500">
                              No se encontró ningún proyecto con "{projectSearchQuery}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedProjectTemplate && (
                      <div className="flex items-center justify-between pt-1 px-1 text-[11px] font-mono">
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Plantilla activa cargada: <b>{selectedProjectTemplate.title}</b></span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectTemplate(null);
                            showToast('Plantilla desvinculada (los campos permanecen)');
                          }}
                          className="text-zinc-500 hover:text-zinc-300 underline"
                        >
                          Desvincular
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-zinc-400">ID Único (slug de la app)</label>
                      <input
                        type="text"
                        required
                        value={editingApp.id}
                        onChange={(e) => setEditingApp({ ...editingApp, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono text-zinc-400">Nombre Corto (pestaña carrusel)</label>
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
                    <label className="text-xs font-mono text-zinc-400">Título Completo Principal</label>
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
                      <label className="text-xs font-mono text-zinc-400">Estilo de Color del Badge</label>
                      <select
                        value={editingApp.badgeColor || ''}
                        onChange={(e) => setEditingApp({ ...editingApp, badgeColor: e.target.value })}
                        className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                      >
                        {BADGE_COLOR_PRESETS.map((b, idx) => (
                          <option key={idx} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  {/* Icon Selector & Scale */}
                  <div className="space-y-3 p-3 rounded-lg bg-[#07090e] border border-zinc-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-mono text-zinc-300 block">Ruta del Icono</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono text-zinc-500">Escala:</span>
                        <select
                          value={editingApp.iconScale || ''}
                          onChange={(e) => setEditingApp({ ...editingApp, iconScale: e.target.value })}
                          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-300"
                        >
                          {ICON_SCALE_PRESETS.map((s, idx) => (
                            <option key={idx} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
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

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-400">Descripción Detallada</label>
                    <textarea
                      rows={3}
                      value={editingApp.description}
                      onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                      className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 leading-relaxed"
                    />
                  </div>

                  {/* Features & Tags Manager */}
                  <div className="space-y-3 p-3.5 rounded-xl bg-[#07090e] border border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-mono font-bold text-zinc-200 block">
                          Características / Tags Técnicos de la App
                        </label>
                        <span className="text-[11px] font-mono text-zinc-500">
                          Badges inferiores que destacan cifrado, motores, compresión, etc.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-cyan-300 flex items-center space-x-1 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>+ Tag</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(!editingApp.features || editingApp.features.length === 0) && (
                        <div className="text-xs font-mono text-zinc-500 p-2 border border-dashed border-zinc-800 rounded-lg text-center">
                          No hay características añadidas. Haz clic en "+ Tag" para añadir una.
                        </div>
                      )}
                      {editingApp.features && editingApp.features.map((feat, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#050608] border border-zinc-800 flex flex-col gap-2">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={feat.label}
                              onChange={(e) => handleUpdateFeature(idx, 'label', e.target.value)}
                              placeholder="Ej: Cifrado Bóveda AES-256"
                              className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded px-2.5 py-1 text-xs font-mono text-zinc-200"
                            />
                            <div className="flex items-center space-x-1.5">
                              <select
                                value={feat.iconName || 'Zap'}
                                onChange={(e) => handleUpdateFeature(idx, 'iconName', e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-300"
                              >
                                {AVAILABLE_FEATURE_ICONS.map(icon => (
                                  <option key={icon} value={icon}>{icon}</option>
                                ))}
                              </select>
                              <select
                                value={feat.color || 'text-cyan-400'}
                                onChange={(e) => handleUpdateFeature(idx, 'color', e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-300"
                              >
                                {AVAILABLE_FEATURE_COLORS.map(col => (
                                  <option key={col.value} value={col.value}>{col.label}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(idx)}
                                className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                                title="Eliminar este tag"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={feat.description || ''}
                            onChange={(e) => handleUpdateFeature(idx, 'description', e.target.value)}
                            placeholder="Descripción opcional (si está vacía, solo se muestra el título en la ficha)"
                            className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded px-2.5 py-1 text-[11px] font-sans text-zinc-300 placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download Action Box Fields */}
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
                      <label className="text-xs font-mono text-zinc-400">Enlace Repositorio GitHub</label>
                      <input
                        type="text"
                        value={editingApp.repoUrl}
                        onChange={(e) => setEditingApp({ ...editingApp, repoUrl: e.target.value })}
                        className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono text-zinc-400">Nota al Pie (Meta Info)</label>
                      <input
                        type="text"
                        value={editingApp.metaInfo}
                        onChange={(e) => setEditingApp({ ...editingApp, metaInfo: e.target.value })}
                        className="w-full bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                      />
                    </div>
                  </div>
                </>
              )}
              </div>

              {/* Pinned Fixed Footer */}
              <div className="flex-shrink-0 border-t border-zinc-800/90 bg-[#080a12] px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs border border-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Aplicación</span>
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-[#0c0e17] border border-zinc-800/90 rounded-2xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* Pinned Fixed Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3.5 sm:px-6 sm:py-4 flex-shrink-0 bg-[#0a0c14] gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <Gamepad2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 truncate">
                  {projects.some(p => p.id === editingProject.id) ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center font-mono text-sm transition"
                title="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProjectForm} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto modal-scroll p-4 sm:p-6 space-y-4">
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
              </div>

              {/* Pinned Fixed Footer */}
              <div className="flex-shrink-0 border-t border-zinc-800/90 bg-[#080a12] px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs border border-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Proyecto</span>
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-[#0c0e17] border border-zinc-800/90 rounded-2xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            {/* Pinned Fixed Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3.5 sm:px-6 sm:py-4 flex-shrink-0 bg-[#0a0c14] gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <FileDown className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <h3 className="text-base font-bold text-zinc-100 truncate">
                  Exportar Datos ({exportDataType === 'full' ? 'Respaldo Completo' : exportDataType})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center font-mono text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto modal-scroll p-4 sm:p-6 space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Descarga este archivo JSON o cópialo al portapapeles para restaurarlo cuando desees o incluirlo en el código fuente.
              </p>

              <div className="relative">
                <textarea
                  readOnly
                  rows={12}
                  value={exportDataString}
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 focus:outline-none modal-scroll max-h-[50vh]"
                />
              </div>
            </div>

            {/* Pinned Fixed Footer */}
            <div className="flex-shrink-0 border-t border-zinc-800/90 bg-[#080a12] px-4 py-3 sm:px-6 sm:py-3.5 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={copyToClipboard}
                className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono transition flex items-center space-x-1.5"
              >
                {copiedExport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                <span>{copiedExport ? '¡COPIADO!' : 'Copiar al Portapapeles'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-mono text-xs border border-zinc-800"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={downloadJsonFile}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-[#0c0e17] border border-zinc-800/90 rounded-2xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            {/* Pinned Fixed Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3.5 sm:px-6 sm:py-4 flex-shrink-0 bg-[#0a0c14] gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <FileUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <h3 className="text-base font-bold text-zinc-100 truncate">Importar / Restaurar Respaldo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center font-mono text-sm transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Scrollable Body */}
              <div className="flex-1 min-h-0 overflow-y-auto modal-scroll p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Sube un archivo <span className="font-mono text-cyan-400">.json</span> o pega el contenido para restaurar al instante:
                  </p>
                  <div>
                    <input
                      type="file"
                      ref={importFileInputRef}
                      onChange={handleImportFileSelect}
                      accept=".json,application/json"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => importFileInputRef.current?.click()}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-cyan-300 font-mono text-xs transition active:scale-95 shadow cursor-pointer whitespace-nowrap"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Cargar archivo .json</span>
                    </button>
                  </div>
                </div>

                <textarea
                  required
                  rows={10}
                  value={importJsonInput}
                  onChange={(e) => {
                    setImportJsonInput(e.target.value);
                    setImportError('');
                  }}
                  placeholder="Pega aquí el JSON exportado o usa el botón de arriba para seleccionar tu archivo .json..."
                  className="w-full bg-[#050608] border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500 modal-scroll max-h-[50vh]"
                />

                {importError && (
                  <div className="text-xs font-mono text-rose-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}
              </div>

              {/* Pinned Fixed Footer */}
              <div className="flex-shrink-0 border-t border-zinc-800/90 bg-[#080a12] px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-mono text-xs border border-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95"
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
