import React, { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../theme';
import { useAppearance } from '../../appearance';
import { Tile } from './Brand';

const YEAR = new Date().getFullYear();

const NAV = [
  { label: 'Creaciones', href: '/#creaciones' },
  { label: 'Launcher', href: '/#launcher' },
  { label: 'Acortador', href: '/links' },
  { label: 'Skins', href: '/skins' },
  { label: 'Acerca de', href: '/acerca' },
];

export function Link({ to, navigate, className, children, ...rest }) {
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={onClick} className={className} {...rest}>
      {children}
    </a>
  );
}

export function GithubMark({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function Logo({ className = 'w-7 h-7' }) {
  const { icon } = useAppearance();
  return <Tile icon={icon} className={className} />;
}

export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Usar tema claro' : 'Usar tema oscuro'}
      title={dark ? 'Tema claro' : 'Tema oscuro'}
      className="w-9 h-9 rounded-lg border border-line text-muted hover:text-fg hover:border-dim transition flex items-center justify-center"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

export function Header({ navigate, current }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" navigate={navigate} className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Logo />
          <span>KyrnForge</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              navigate={navigate}
              aria-current={current === item.href ? 'page' : undefined}
              className="hover:text-fg transition aria-[current=page]:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/devlwte"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden sm:flex w-9 h-9 rounded-lg border border-line text-muted hover:text-fg hover:border-dim transition items-center justify-center"
          >
            <GithubMark />
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            className="md:hidden w-9 h-9 rounded-lg border border-line text-muted hover:text-fg transition flex items-center justify-center"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-line px-4 py-3 flex flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              navigate={(to) => {
                setOpen(false);
                navigate(to);
              }}
              className="py-2.5 text-fg border-b border-line last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <a href="https://github.com/devlwte" target="_blank" rel="noreferrer" className="py-2.5 text-muted">
            GitHub
          </a>
        </nav>
      )}
    </header>
  );
}

export function Footer({ navigate }) {
  return (
    <footer className="border-t border-line mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row gap-6 sm:items-center justify-between text-sm">
        <div className="flex items-center gap-2.5 text-muted">
          <Logo className="w-5 h-5" />
          <span>KyrnForge · {YEAR}</span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-muted">
          <Link to="/acerca" navigate={navigate} className="hover:text-fg transition">Acerca de</Link>
          <Link to="/privacidad" navigate={navigate} className="hover:text-fg transition">Privacidad</Link>
          <a href="/privacy-policy/" className="hover:text-fg transition">Políticas de las apps</a>
          <a href="https://github.com/devlwte" target="_blank" rel="noreferrer" className="hover:text-fg transition">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}

export default function Layout({ navigate, current, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-fg">
      <Header navigate={navigate} current={current} />
      <div className="flex-1">{children}</div>
      <Footer navigate={navigate} />
    </div>
  );
}
