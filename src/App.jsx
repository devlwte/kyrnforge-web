import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import AppDetailView from './components/AppDetailView';
import KyrnLinksView from './components/KyrnLinksView';
import HomeView from './components/site/HomeView';
import AboutView from './components/site/AboutView';
import PrivacyView from './components/site/PrivacyView';
import { initialAvailableApps } from './data/defaultApps';
import { initialProjects } from './data/defaultSiteData';
import { buildCatalog } from './data/catalog';

const SkinsApp = lazy(() => import('./components/skins/SkinsApp'));
const SkinsModeration = lazy(() => import('./components/SkinsModeration'));
const ModDashboard = lazy(() => import('./components/ModDashboard'));
const lazyFallback = <div className="min-h-screen bg-[#090d16]" />;

const HOME_TITLE = 'KyrnForge · Software independiente para escritorio y Android';

function readCached(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeCached(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // La caché es opcional.
  }
}

const fetchJson = (url) =>
  fetch(url, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [availableApps, setAvailableApps] = useState(() => readCached('kyrnforge_available_apps') || initialAvailableApps || []);
  const [projects, setProjects] = useState(() => readCached('kyrnforge_projects') || initialProjects || []);

  const catalog = useMemo(() => buildCatalog(availableApps, projects), [availableApps, projects]);

  const scrollToHash = useCallback(() => {
    const id = window.location.hash.slice(1);
    const target = id && document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0 });
  }, []);

  const navigateTo = useCallback((to) => {
    const url = new URL(to, window.location.origin);
    if (url.pathname + url.hash !== window.location.pathname + window.location.hash) {
      window.history.pushState({}, '', url.pathname + url.search + url.hash);
    }
    setCurrentPath(url.pathname);
    requestAnimationFrame(scrollToHash);
  }, [scrollToHash]);

  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (window.location.hash) requestAnimationFrame(scrollToHash);
  }, [scrollToHash]);

  useEffect(() => {
    if (currentPath === '/' || currentPath === '') document.title = HOME_TITLE;
  }, [currentPath]);

  useEffect(() => {
    const load = async () => {
      const t = Date.now();
      const content = await fetchJson(`/api/v1/content?t=${t}`);
      let apps = content?.availableApps;
      let list = content?.projects;
      if (!Array.isArray(apps) || apps.length === 0) {
        [apps, list] = await Promise.all([fetchJson(`/data/apps.json?t=${t}`), fetchJson(`/data/projects.json?t=${t}`)]);
      }
      if (Array.isArray(apps) && apps.length > 0) {
        setAvailableApps(apps);
        writeCached('kyrnforge_available_apps', apps);
      }
      if (Array.isArray(list) && list.length > 0) {
        setProjects(list);
        writeCached('kyrnforge_projects', list);
      }
    };
    load();
  }, []);

  const goHome = () => navigateTo('/');

  if (currentPath === '/mod/skins') {
    return <Suspense fallback={lazyFallback}><SkinsModeration onNavigateHome={() => navigateTo('/mod')} /></Suspense>;
  }

  if (currentPath === '/skins' || currentPath.startsWith('/skins/')) {
    return (
      <Suspense fallback={lazyFallback}>
        <SkinsApp path={currentPath} navigate={navigateTo} onNavigateHome={goHome} />
      </Suspense>
    );
  }

  if (currentPath === '/mod' || currentPath === '/mod/') {
    return <Suspense fallback={lazyFallback}><ModDashboard onNavigateHome={goHome} /></Suspense>;
  }

  if (currentPath === '/links' || currentPath.startsWith('/links/') || currentPath === '/sh' || currentPath.startsWith('/sh/')) {
    return <KyrnLinksView navigate={navigateTo} current="/links" />;
  }

  if (currentPath.startsWith('/app/') || currentPath === '/app') {
    const appId = currentPath.replace(/^\/app\/?/, '').split('/')[0];
    return <AppDetailView appId={appId} catalog={catalog} navigate={navigateTo} />;
  }

  if (currentPath === '/acerca' || currentPath === '/acerca/') {
    return <AboutView navigate={navigateTo} />;
  }

  if (currentPath === '/privacidad' || currentPath === '/privacidad/') {
    return <PrivacyView navigate={navigateTo} />;
  }

  return <HomeView catalog={catalog} navigate={navigateTo} />;
}
