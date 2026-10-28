import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Copy, ExternalLink, QrCode, Trash2 } from 'lucide-react';
import Layout from './site/Layout';

const HISTORY_KEY = 'kyrn_recent_links_v1';

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // El historial es opcional.
  }
}

function CopyButton({ text, id, copiedId, onCopy, className = '' }) {
  const done = copiedId === id;
  return (
    <button type="button" onClick={() => onCopy(text, id)} className={className}>
      {done ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
      <span>{done ? 'Copiado' : 'Copiar'}</span>
    </button>
  );
}

export default function KyrnLinksView({ navigate, current }) {
  const [targetUrl, setTargetUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showAlias, setShowAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    document.title = 'Acortador de enlaces · KyrnForge';
  }, []);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const remember = (link) => {
    const next = [link, ...history.filter((l) => l.slug !== link.slug)].slice(0, 15);
    setHistory(next);
    saveHistory(next);
  };

  const forget = (slug) => {
    const next = history.filter((l) => l.slug !== slug);
    setHistory(next);
    saveHistory(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setShowQr(false);

    const url = targetUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      setError('El enlace tiene que empezar por https:// o http://');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customSlug: customSlug.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'No se pudo acortar el enlace.');
        return;
      }
      const link = {
        slug: data.slug,
        shortUrl: data.shortUrl || `${window.location.origin}/l/${data.slug}`,
        targetUrl: data.targetUrl || url,
        hostname: data.hostname || new URL(url).hostname,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      setResult(link);
      remember(link);
      setTargetUrl('');
      setCustomSlug('');
    } catch {
      setError('No hubo respuesta del servidor. Prueba otra vez en un momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout navigate={navigate} current={current}>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24">
        <p className="eyebrow">Herramienta</p>
        <h1 className="display text-4xl sm:text-5xl leading-[1.05] mt-4">Acorta un enlace.</h1>
        <p className="mt-5 text-lg text-muted leading-relaxed">
          Pega una dirección larga y llévate una corta de kyrnforge.dev. No hace falta cuenta. Los enlaces duran
          90 días y no pueden apuntar a sitios para adultos.
        </p>

        <form onSubmit={submit} className="mt-10 card p-4 sm:p-6 space-y-4">
          <label htmlFor="target-url" className="text-sm font-medium">Enlace</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="target-url"
              type="url"
              inputMode="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://"
              required
              className="flex-1 min-w-0 rounded-lg border border-line bg-bg px-3.5 py-3 text-[15px] placeholder:text-dim outline-none focus:border-accent transition"
            />
            <button type="submit" disabled={loading} className="btn-primary py-3 disabled:opacity-60">
              {loading ? 'Acortando…' : 'Acortar'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {showAlias ? (
            <div className="space-y-2">
              <label htmlFor="alias" className="text-sm font-medium">Nombre propio (opcional)</label>
              <div className="flex rounded-lg border border-line bg-bg overflow-hidden focus-within:border-accent transition">
                <span className="px-3 py-2.5 text-sm text-dim font-mono border-r border-line bg-raised whitespace-nowrap">/l/</span>
                <input
                  id="alias"
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  placeholder="mi-enlace"
                  className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm font-mono outline-none"
                />
              </div>
              <p className="text-xs text-dim">Letras, números y guiones. Mínimo 3 caracteres.</p>
            </div>
          ) : (
            <button type="button" onClick={() => setShowAlias(true)} className="text-sm text-muted hover:text-fg underline underline-offset-4 decoration-line">
              Elegir un nombre propio
            </button>
          )}

          {error && (
            <p className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {result && (
            <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 space-y-3">
              <p className="text-sm text-muted">
                Listo. Apunta a <span className="text-fg">{result.hostname}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  readOnly
                  value={result.shortUrl}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 min-w-0 rounded-lg border border-line bg-bg px-3 py-2.5 font-mono text-sm outline-none"
                />
                <div className="flex gap-2">
                  <CopyButton text={result.shortUrl} id="new" copiedId={copiedId} onCopy={copy} className="btn-primary flex-1 sm:flex-initial" />
                  <button type="button" onClick={() => setShowQr((v) => !v)} className="btn-ghost px-3" aria-label="Mostrar código QR" aria-pressed={showQr}>
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {showQr && (
                <div className="pt-1">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(result.shortUrl)}`}
                    alt="Código QR del enlace corto"
                    className="w-40 h-40 rounded-lg bg-white"
                  />
                </div>
              )}
            </div>
          )}
        </form>

        {history.length > 0 && (
          <section className="mt-14 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">Tus enlaces</h2>
              <span className="text-sm text-dim">Guardados solo en este navegador</span>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {history.map((item) => (
                <li key={item.slug} className="py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm truncate">/l/{item.slug}</p>
                    <p className="text-sm text-dim truncate" title={item.targetUrl}>{item.hostname}</p>
                  </div>
                  <CopyButton
                    text={item.shortUrl}
                    id={item.slug}
                    copiedId={copiedId}
                    onCopy={copy}
                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition px-2 py-1.5"
                  />
                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir enlace"
                    className="p-2 text-dim hover:text-fg transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => forget(item.slug)}
                    aria-label="Quitar de la lista"
                    className="p-2 text-dim hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-14 grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-medium">Revisión de destino</h3>
            <p className="text-muted mt-1 leading-relaxed">Se rechazan sitios para adultos, redes privadas y enlaces que esconden otro acortador.</p>
          </div>
          <div>
            <h3 className="font-medium">Aviso antes de salir</h3>
            <p className="text-muted mt-1 leading-relaxed">Quien abre el enlace ve a qué dominio va antes de continuar.</p>
          </div>
          <div>
            <h3 className="font-medium">¿Un enlace abusivo?</h3>
            <p className="text-muted mt-1 leading-relaxed">
              Escribe a <a href="mailto:abuse@kyrnforge.dev" className="text-fg underline underline-offset-4 decoration-line">abuse@kyrnforge.dev</a> y lo retiro.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
