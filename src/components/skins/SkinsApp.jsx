import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import './skins.css';
import { SessionProvider, useSession } from './shared.jsx';
import { Account, Gallery, MySkins, Upload, Viewer } from './pages.jsx';
import { Creator } from './creator.jsx';

/// Rutas: /skins, /skins/crear, /skins/subir, /skins/editar/:nombre, /skins/ver/:nombre, /skins/mis-skins, /skins/cuenta
function route(path) {
  const parts = path.split('?')[0].replace(/^\/skins\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  return { section: parts[0] || 'galeria', arg: parts[1] || '' };
}

function Header({ section, navigate, onNavigateHome }) {
  const { me } = useSession();
  const tabs = [['galeria', 'Galería', '/skins'], ['crear', 'Crear', '/skins/crear'], ['subir', 'Subir', '/skins/subir'], ['mis-skins', 'Mis aspectos', '/skins/mis-skins']];
  return (
    <header className="mcs-header">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <button className="mcs-btn !px-2" onClick={onNavigateHome} aria-label="Volver a kyrnforge.dev"><ArrowLeft size={16} /></button>
        <button className="flex items-center gap-3 mr-auto" onClick={() => navigate('/skins')}>
          <img src="/skins-icon.png" alt="" className="w-9 h-9 border-2 border-black" />
          <span className="text-left">
            <span className="mcs-title block text-lg sm:text-xl leading-none">KYRNFORGE SKINS</span>
            <span className="text-[11px] text-[#d6d6d6]">Aspectos para jugar sin conexión con xLaunch</span>
          </span>
        </button>
        <nav className="mcs-nav order-last w-full sm:order-none sm:w-auto">
          {tabs.map(([id, label, href]) => (
            <button key={id} className="mcs-btn" aria-current={section === id ? 'page' : undefined} onClick={() => navigate(href)}>{label}</button>
          ))}
          <button className="mcs-btn" aria-current={section === 'cuenta' ? 'page' : undefined} onClick={() => navigate('/skins/cuenta')}>
            <User size={16} /> <span className="max-w-[110px] truncate">{me ? me.user.name : 'Entrar'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function SkinsApp({ path, navigate, onNavigateHome }) {
  const { section, arg } = route(path);
  let page;
  if (section === 'ver' && arg) page = <Viewer name={arg} navigate={navigate} />;
  else if (section === 'crear') page = <Creator navigate={navigate} />;
  else if (section === 'subir') page = <Upload key="new" navigate={navigate} />;
  else if (section === 'editar' && arg) page = <Upload key={`edit-${arg}`} editName={arg} navigate={navigate} />;
  else if (section === 'mis-skins') page = <MySkins navigate={navigate} />;
  else if (section === 'cuenta') page = <Account navigate={navigate} />;
  else page = <Gallery navigate={navigate} />;

  return (
    <SessionProvider>
      <div className="mcs">
        <Header section={section === 'editar' ? 'subir' : section} navigate={navigate} onNavigateHome={onNavigateHome} />
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">{page}</main>
        <footer className="text-center text-[11px] text-[#8a8a8a] py-4">
          Texturas originales de KyrnForge · Fuente: Monocraft (OFL) · No afiliado a Mojang ni Microsoft
        </footer>
      </div>
    </SessionProvider>
  );
}
