import React from 'react';
import { ArrowRight, ArrowUpRight, Download } from 'lucide-react';
import Layout, { Link } from './Layout';
import AppIcon from './AppIcon';

const WORKBENCH = [
  ['Launcher de KyrnForge', 'Un solo programa para instalar y actualizar todo lo de esta página.'],
  ['Juegos para Android', 'Proyectos pequeños hechos en Godot, con arte y sonido propios.'],
  ['Minecraft', 'Aspectos, un launcher sin conexión y mods para Fabric.'],
];

function CatalogCard({ item, navigate }) {
  return (
    <article className="card p-5 sm:p-6 flex flex-col gap-4 hover:border-dim transition group">
      <div className="flex items-start gap-4">
        <AppIcon item={item} className="w-14 h-14 rounded-xl" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg leading-snug">
            <Link to={`/app/${item.id}`} navigate={navigate} className="hover:text-accent transition">
              {item.title}
            </Link>
          </h3>
          {item.category && <p className="text-sm text-dim mt-0.5 truncate">{item.category}</p>}
          {item.version && <p className="font-mono text-xs text-dim mt-1">{item.version}</p>}
        </div>
      </div>

      <p className="text-[15px] text-muted leading-relaxed line-clamp-3">{item.description}</p>

      <div className="mt-auto pt-2 flex items-center justify-between gap-3 text-sm">
        <Link
          to={`/app/${item.id}`}
          navigate={navigate}
          className="inline-flex items-center gap-1.5 font-medium text-fg hover:text-accent transition"
        >
          Ver ficha
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        {item.downloadUrl && (
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted hover:text-fg transition"
          >
            <Download className="w-4 h-4" />
            Descargar
          </a>
        )}
      </div>
    </article>
  );
}

export default function HomeView({ catalog, navigate }) {
  return (
    <Layout navigate={navigate} current="/">
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        <section className="pt-16 sm:pt-24 pb-16 sm:pb-20 grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16 items-end">
          <div className="space-y-6">
            <p className="eyebrow">Estudio independiente</p>
            <h1 className="display text-[2.5rem] sm:text-5xl lg:text-6xl leading-[1.05]">
              Software, juegos y herramientas <em className="not-italic text-accent">hechos a mano.</em>
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-xl">
              KyrnForge es donde publico lo que voy terminando: aplicaciones de escritorio para Windows,
              apps y juegos para Android y utilidades para Minecraft. Todo es gratuito.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/#creaciones" navigate={navigate} className="btn-primary">
                Ver creaciones
              </Link>
              <Link to="/acerca" navigate={navigate} className="btn-ghost">
                Quién está detrás
              </Link>
            </div>
          </div>

          <aside className="card p-6 space-y-4">
            <p className="eyebrow">En el taller</p>
            <ul className="space-y-4">
              {WORKBENCH.map(([title, text]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted leading-relaxed">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section id="creaciones" className="scroll-mt-24 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="eyebrow">Catálogo</p>
              <h2 className="text-3xl font-semibold tracking-tight mt-2">Creaciones</h2>
            </div>
            <p className="text-sm text-dim">
              {catalog.length} {catalog.length === 1 ? 'proyecto publicado' : 'proyectos publicados'}
            </p>
          </div>

          {catalog.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {catalog.map((item) => (
                <CatalogCard key={item.id} item={item} navigate={navigate} />
              ))}
            </div>
          ) : (
            <p className="text-muted">Cargando el catálogo…</p>
          )}
        </section>

        <section id="launcher" className="scroll-mt-24 mt-24 card overflow-hidden">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 p-6 sm:p-10 items-center">
            <div className="space-y-4 max-w-2xl">
              <p className="eyebrow">Próximamente</p>
              <h2 className="display text-3xl sm:text-4xl leading-tight">Todo en un solo launcher.</h2>
              <p className="text-muted leading-relaxed">
                Estoy preparando un launcher para instalar, actualizar y abrir cualquier creación de KyrnForge
                desde un mismo lugar, sin ir buscando enlaces uno por uno. Mientras tanto, cada ficha tiene su
                descarga directa.
              </p>
            </div>
            <div className="flex md:flex-col gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                En desarrollo
              </span>
              <a
                href="https://github.com/devlwte"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-muted hover:text-fg transition px-3 py-1.5"
              >
                Seguir en GitHub
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="mt-24 grid md:grid-cols-3 gap-10 md:gap-8">
          <div>
            <p className="eyebrow">Más cosas</p>
            <h2 className="text-3xl font-semibold tracking-tight mt-2">Herramientas en la web</h2>
          </div>
          <Link to="/links" navigate={navigate} className="card p-6 hover:border-dim transition group block">
            <p className="font-semibold flex items-center justify-between">
              Acortador de enlaces
              <ArrowRight className="w-4 h-4 text-dim group-hover:text-fg group-hover:translate-x-0.5 transition" />
            </p>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Convierte un enlace largo en uno corto de kyrnforge.dev. Sin cuenta y con filtro de contenido para adultos.
            </p>
          </Link>
          <Link to="/skins" navigate={navigate} className="card p-6 hover:border-dim transition group block">
            <p className="font-semibold flex items-center justify-between">
              KyrnForge Skins
              <ArrowRight className="w-4 h-4 text-dim group-hover:text-fg group-hover:translate-x-0.5 transition" />
            </p>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Crea o sube aspectos de Minecraft y úsalos al jugar sin conexión con xLaunch.
            </p>
          </Link>
        </section>
      </main>
    </Layout>
  );
}
