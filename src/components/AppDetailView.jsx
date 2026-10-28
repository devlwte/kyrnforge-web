import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, Share2 } from 'lucide-react';
import Layout, { GithubMark, Link } from './site/Layout';
import AppIcon from './site/AppIcon';
import { findInCatalog } from '../data/catalog';

export default function AppDetailView({ appId, catalog, navigate }) {
  const [copied, setCopied] = useState(false);
  const app = findInCatalog(catalog, appId);
  const others = catalog.filter((item) => item.id !== app?.id);

  useEffect(() => {
    document.title = app ? `${app.title} · KyrnForge` : 'No encontrado · KyrnForge';
  }, [app]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: app.title, url });
        return;
      } catch {
        // Si se cancela, se copia el enlace.
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!app) {
    return (
      <Layout navigate={navigate}>
        <main className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center space-y-5">
          <p className="eyebrow">404</p>
          <h1 className="font-serif text-4xl">No encontré esa creación</h1>
          <p className="text-muted">
            No hay nada publicado en <span className="font-mono text-fg">/app/{appId}</span>. Puede que haya cambiado de nombre.
          </p>
          <Link to="/#creaciones" navigate={navigate} className="btn-primary">
            Ver el catálogo
          </Link>
        </main>
      </Layout>
    );
  }

  const facts = [
    ['Versión', app.version],
    ['Categoría', app.category],
    ['Sistema', app.system],
    ['Precio', 'Gratis'],
  ].filter(([, value]) => value);

  return (
    <Layout navigate={navigate}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <Link
          to="/#creaciones"
          navigate={navigate}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Creaciones
        </Link>

        <section className="mt-8 flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-center">
          <AppIcon item={app} className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl" />
          <div className="space-y-2 min-w-0">
            <p className="eyebrow">{app.category || 'Creación'}</p>
            <h1 className="font-serif text-4xl sm:text-5xl leading-tight break-words">{app.title}</h1>
          </div>
        </section>

        <div className="mt-10 grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-14">
          <div className="space-y-12 min-w-0">
            <p className="text-lg text-muted leading-relaxed">{app.description}</p>

            {app.traits.length > 0 && (
              <section className="space-y-5">
                <h2 className="text-xl font-semibold">Qué hace</h2>
                <ul className="divide-y divide-line border-y border-line">
                  {app.traits.map((t) => (
                    <li key={t.label} className="py-4 grid sm:grid-cols-[200px_1fr] gap-1 sm:gap-6">
                      <span className="font-medium">{t.label}</span>
                      {t.description && <span className="text-muted leading-relaxed">{t.description}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="order-first lg:order-none lg:sticky lg:top-24 self-start card p-5 space-y-5 w-full">
            <div className="space-y-2.5">
              {app.downloadUrl && (
                <a href={app.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                  <Download className="w-4 h-4" />
                  Descargar
                </a>
              )}
              {app.repoUrl && (
                <a href={app.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full">
                  <GithubMark />
                  Código fuente
                </a>
              )}
              <button type="button" onClick={share} className="btn-ghost w-full">
                {copied ? <Check className="w-4 h-4 text-ok" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Enlace copiado' : 'Compartir'}
              </button>
            </div>

            {facts.length > 0 && (
              <dl className="text-sm divide-y divide-line border-t border-line">
                {facts.map(([label, value]) => (
                  <div key={label} className="py-2.5 flex justify-between gap-4">
                    <dt className="text-dim">{label}</dt>
                    <dd className="text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </aside>
        </div>

        {others.length > 0 && (
          <section className="mt-24 space-y-6">
            <h2 className="text-xl font-semibold">Otras creaciones</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((item) => (
                <Link
                  key={item.id}
                  to={`/app/${item.id}`}
                  navigate={navigate}
                  className="card p-4 flex items-center gap-4 hover:border-dim transition group"
                >
                  <AppIcon item={item} className="w-12 h-12 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-dim truncate">{item.category}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-dim group-hover:text-fg transition flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </Layout>
  );
}
