import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Download, ExternalLink, LogOut, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { Logo, ThemeToggle } from './site/Layout';
import { MARKS, PALETTES, THEMES, normalizeAppearance } from '../brand';
import { useAppearance } from '../appearance';
import { Mark, Tile } from './site/Brand';

const TOKEN_KEY = 'kyrnforge_auth_token';

const ICON_PRESETS = [
  '/projects/kyrnex.png',
  '/projects/kpm.png',
  '/projects/kyrn-devdock.png',
  '/projects/2dgo.png',
  '/projects/playwarp.svg',
  '/projects/default-app.svg',
];

const EMPTY = {
  id: '',
  title: '',
  category: '',
  badge: '',
  system: '',
  iconImg: '/projects/default-app.svg',
  description: '',
  downloadUrl: '',
  repoUrl: '',
  features: [],
};

const inputClass =
  'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[15px] placeholder:text-dim outline-none focus:border-accent transition';

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const labelOf = (t) => (typeof t === 'object' ? t?.label || t?.name || '' : String(t || ''));
const descOf = (t) => (typeof t === 'object' ? String(t?.description || '') : '');

/// Junta las apps del carrusel y el catálogo antiguo en una sola lista con el formato de app.
function unify(apps = [], projects = []) {
  const list = (apps || []).filter((a) => a?.id).map((a) => ({ ...a }));
  const ids = new Set(list.map((a) => a.id.toLowerCase()));
  for (const p of projects || []) {
    if (!p?.id) continue;
    const fromProject = {
      id: p.id,
      title: p.title,
      category: p.categoryLabel || p.category || '',
      badge: p.statusLabel || '',
      iconImg: p.iconImg || '',
      description: p.description || '',
      downloadUrl: p.downloadUrl || '',
      repoUrl: p.repoUrl || '',
      features: (p.tags || []).map((t) => ({ label: labelOf(t), description: descOf(t) })),
    };
    if (!ids.has(p.id.toLowerCase())) {
      list.push(fromProject);
      ids.add(p.id.toLowerCase());
      continue;
    }
    const app = list.find((a) => a.id.toLowerCase() === p.id.toLowerCase());
    for (const [k, v] of Object.entries(fromProject)) {
      const current = app[k];
      if ((Array.isArray(current) ? !current.length : !current) && (Array.isArray(v) ? v.length : v)) app[k] = v;
    }
  }
  return list;
}

async function api(path, token, body) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setBusy(true);
    setError('');
    try {
      await api('/api/v1/auth', null, { password: password.trim() });
      onLogin(password.trim());
    } catch {
      setError('Clave incorrecta.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="font-semibold">Panel de KyrnForge</span>
        </div>
        <div className="space-y-2">
          <label htmlFor="mod-pass" className="text-sm font-medium">Clave</label>
          <input
            id="mod-pass"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? 'Comprobando…' : 'Entrar'}
        </button>
        <a href="/" className="block text-center text-sm text-muted hover:text-fg">Volver al sitio</a>
      </form>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-dim">{hint}</span>}
    </label>
  );
}

function Editor({ initial, takenIds, onCancel, onSave, saving }) {
  const [item, setItem] = useState(() => ({ ...EMPTY, ...initial, features: (initial.features || []).map((f) => ({ label: labelOf(f), description: descOf(f) })) }));
  const [idTouched, setIdTouched] = useState(Boolean(initial.id));
  const isNew = !initial.id;

  const set = (key, value) => setItem((prev) => ({ ...prev, [key]: value }));
  const setTitle = (title) => setItem((prev) => ({ ...prev, title, id: idTouched ? prev.id : slugify(title) }));
  const setFeature = (i, key, value) =>
    setItem((prev) => ({ ...prev, features: prev.features.map((f, j) => (j === i ? { ...f, [key]: value } : f)) }));

  const idTaken = item.id && takenIds.includes(item.id.toLowerCase());
  const valid = item.title.trim() && item.id && !idTaken;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSave({
      ...item,
      title: item.title.trim(),
      features: item.features.filter((f) => f.label.trim()).map((f) => ({ label: f.label.trim(), description: f.description.trim() })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onCancel}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl h-full bg-bg border-l border-line flex flex-col"
      >
        <header className="flex items-center justify-between px-5 h-16 border-b border-line flex-shrink-0">
          <h2 className="font-semibold">{isNew ? 'Nueva creación' : `Editar ${initial.title}`}</h2>
          <button type="button" onClick={onCancel} aria-label="Cerrar" className="p-2 text-muted hover:text-fg">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          <Field label="Nombre">
            <input required value={item.title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Kyrn DevDock" />
          </Field>

          <Field
            label="Dirección"
            hint={idTaken ? 'Ya existe otra creación con esta dirección.' : `kyrnforge.dev/app/${item.id || '…'}`}
          >
            <input
              required
              value={item.id}
              onChange={(e) => {
                setIdTouched(true);
                set('id', slugify(e.target.value));
              }}
              className={`${inputClass} font-mono text-sm ${idTaken ? 'border-red-500' : ''}`}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Categoría">
              <input value={item.category} onChange={(e) => set('category', e.target.value)} className={inputClass} placeholder="Herramientas de desarrollo" />
            </Field>
            <Field label="Versión">
              <input value={item.badge} onChange={(e) => set('badge', e.target.value)} className={inputClass} placeholder="v1.0.0" />
            </Field>
          </div>

          <Field label="Sistema" hint="Opcional. Por ejemplo: Windows 10/11 (64-bit) o Android 9+.">
            <input value={item.system} onChange={(e) => set('system', e.target.value)} className={inputClass} />
          </Field>

          <Field label="Descripción">
            <textarea rows={5} value={item.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} resize-y`} />
          </Field>

          <Field label="Icono" hint="Ruta dentro de public/ o una URL completa.">
            <div className="flex gap-3 items-center">
              <img
                src={item.iconImg || '/projects/default-app.svg'}
                alt=""
                className="w-11 h-11 rounded-lg border border-line object-cover bg-raised flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/projects/default-app.svg';
                }}
              />
              <input list="icon-presets" value={item.iconImg} onChange={(e) => set('iconImg', e.target.value)} className={`${inputClass} font-mono text-sm`} />
              <datalist id="icon-presets">
                {ICON_PRESETS.map((p) => <option key={p} value={p} />)}
              </datalist>
            </div>
          </Field>

          <Field label="Enlace de descarga" hint="Si lo dejas vacío se usa la página de releases del repositorio.">
            <input type="url" value={item.downloadUrl} onChange={(e) => set('downloadUrl', e.target.value)} className={inputClass} placeholder="https://github.com/…/releases" />
          </Field>

          <Field label="Repositorio">
            <input type="url" value={item.repoUrl} onChange={(e) => set('repoUrl', e.target.value)} className={inputClass} placeholder="https://github.com/devlwte/…" />
          </Field>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Qué hace</legend>
            {item.features.map((f, i) => (
              <div key={i} className="rounded-lg border border-line p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={f.label}
                    onChange={(e) => setFeature(i, 'label', e.target.value)}
                    placeholder="Título corto"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => set('features', item.features.filter((_, j) => j !== i))}
                    aria-label="Quitar"
                    className="p-2 text-dim hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={f.description}
                  onChange={(e) => setFeature(i, 'description', e.target.value)}
                  placeholder="Explicación (opcional)"
                  className={`${inputClass} text-sm resize-y`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => set('features', [...item.features, { label: '', description: '' }])}
              className="btn-ghost w-full"
            >
              <Plus className="w-4 h-4" />
              Añadir punto
            </button>
          </fieldset>
        </div>

        <footer className="flex gap-3 justify-end px-5 py-4 border-t border-line flex-shrink-0">
          <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
          <button type="submit" disabled={!valid || saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </footer>
      </form>
    </div>
  );
}

function CreationsTab({ items, onSave, saving }) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const move = (index, delta) => {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(index + delta, 0, moved);
    onSave(next);
  };

  const saveItem = async (item) => {
    const exists = editing.id && items.some((i) => i.id === editing.id);
    const next = exists ? items.map((i) => (i.id === editing.id ? item : i)) : [...items, item];
    if (await onSave(next)) setEditing(null);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Creaciones</h1>
          <p className="text-sm text-muted mt-1">Lo que aparece en la portada, en el mismo orden.</p>
        </div>
        <button type="button" onClick={() => setEditing(EMPTY)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>

      {items.length === 0 ? (
        <p className="card p-8 text-center text-muted">Todavía no hay nada. Crea la primera.</p>
      ) : (
        <ul className="card divide-y divide-line">
          {items.map((item, i) => (
            <li key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <img
                src={item.iconImg || '/projects/default-app.svg'}
                alt=""
                className="w-11 h-11 rounded-lg border border-line object-cover bg-raised flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/projects/default-app.svg';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-sm text-dim truncate">{[item.badge, item.category].filter(Boolean).join(' · ') || `/app/${item.id}`}</p>
              </div>

              {confirmId === item.id ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="hidden sm:inline text-muted">¿Eliminar?</span>
                  <button type="button" onClick={() => setConfirmId(null)} className="px-2.5 py-1.5 rounded-md border border-line">No</button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmId(null);
                      onSave(items.filter((x) => x.id !== item.id));
                    }}
                    className="px-2.5 py-1.5 rounded-md bg-red-600 text-white"
                  >
                    Sí
                  </button>
                </div>
              ) : (
                <div className="flex items-center text-dim">
                  <button type="button" disabled={i === 0 || saving} onClick={() => move(i, -1)} aria-label="Subir" className="p-2 hover:text-fg disabled:opacity-30 hidden sm:block">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" disabled={i === items.length - 1 || saving} onClick={() => move(i, 1)} aria-label="Bajar" className="p-2 hover:text-fg disabled:opacity-30 hidden sm:block">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <a href={`/app/${item.id}`} target="_blank" rel="noreferrer" aria-label="Ver ficha" className="p-2 hover:text-fg">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button type="button" onClick={() => setEditing(item)} aria-label="Editar" className="p-2 hover:text-fg">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setConfirmId(item.id)} aria-label="Eliminar" className="p-2 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Editor
          initial={editing}
          takenIds={items.filter((i) => i.id !== editing.id).map((i) => i.id.toLowerCase())}
          onCancel={() => setEditing(null)}
          onSave={saveItem}
          saving={saving}
        />
      )}
    </section>
  );
}

const LIGHT_UI = { bg: '#e8ecf1', surface: '#f7f9fb', line: '#c9d1db', fg: '#141b24', muted: '#4d5a69' };
const DARK_UI = { bg: '#0d1218', surface: '#141b23', line: '#27323e', fg: '#e3e9ef', muted: '#9eabb9' };

function tileStyle(colors) {
  return { '--tile-bg': colors.accent, '--tile-fg': colors.on };
}

function Option({ selected, onSelect, children, className = '' }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`card p-4 text-left transition hover:border-dim ${selected ? 'border-accent ring-1 ring-accent' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

function Preview({ appearance, ui, mode }) {
  const colors = PALETTES[appearance.accent][mode];
  return (
    <div className="rounded-xl border p-4 space-y-4 min-w-0" style={{ background: ui.bg, borderColor: ui.line, color: ui.fg }}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Tile icon={appearance.icon} className="w-6 h-6" style={tileStyle(colors)} />
        KyrnForge
        <span className="ml-auto flex gap-3 text-xs font-normal" style={{ color: ui.muted }}>
          <span>Creaciones</span>
          <span>Acortador</span>
        </span>
      </div>
      <p className="text-xl font-semibold tracking-tight leading-snug">
        Software y juegos <span style={{ color: colors.accent }}>hechos a mano.</span>
      </p>
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded-md px-3 py-1.5" style={{ background: colors.accent, color: colors.on }}>Ver creaciones</span>
        <span className="rounded-md px-3 py-1.5 border" style={{ background: ui.surface, borderColor: ui.line }}>Quién está detrás</span>
      </div>
    </div>
  );
}

function AppearanceTab({ settings, token, onSaved }) {
  const saved = normalizeAppearance(settings?.appearance);
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const changed = JSON.stringify(draft) !== JSON.stringify(saved);
  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const next = { ...(settings || {}), appearance: draft };
      await api('/api/v1/content', token, { siteSettings: next });
      onSaved(next);
      setMessage('Guardado. La web ya usa la nueva apariencia.');
    } catch (err) {
      setMessage(`No se pudo guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Apariencia</h1>
        <p className="text-sm text-muted mt-1">Color, icono y tema con los que se ve la web. Cada visitante puede cambiar entre claro y oscuro.</p>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Color</h2>
        <div role="radiogroup" aria-label="Color" className="grid sm:grid-cols-2 gap-3">
          {Object.entries(PALETTES).map(([id, palette]) => (
            <Option key={id} selected={draft.accent === id} onSelect={() => set('accent', id)} className="flex items-center gap-4">
              <span className="flex gap-1.5 flex-shrink-0">
                <Tile icon={draft.icon} className="w-10 h-10" style={tileStyle(palette.light)} />
                <Tile icon={draft.icon} className="w-10 h-10" style={tileStyle(palette.dark)} />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{palette.name}</span>
                <span className="block text-sm text-muted">{palette.note}</span>
              </span>
            </Option>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Icono</h2>
        <div role="radiogroup" aria-label="Icono" className="grid sm:grid-cols-3 gap-3">
          {Object.entries(MARKS).map(([id, mark]) => {
            const colors = PALETTES[draft.accent].light;
            return (
              <Option key={id} selected={draft.icon === id} onSelect={() => set('icon', id)} className="space-y-3">
                <span className="flex items-end gap-3">
                  <Tile icon={id} className="w-14 h-14" style={tileStyle(colors)} />
                  <Tile icon={id} className="w-8 h-8" style={tileStyle(colors)} />
                  <Tile icon={id} className="w-4 h-4" style={tileStyle(colors)} />
                  <Mark icon={id} className="w-8 h-8 text-fg" />
                </span>
                <span className="block font-medium">{mark.name}</span>
              </Option>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Tema para quien entra por primera vez</h2>
        <div role="radiogroup" aria-label="Tema por defecto" className="inline-flex flex-wrap rounded-lg border border-line p-1 gap-1">
          {Object.entries(THEMES).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={draft.theme === id}
              onClick={() => set('theme', id)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${draft.theme === id ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Vista previa</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Preview appearance={draft} ui={LIGHT_UI} mode="light" />
          <Preview appearance={draft} ui={DARK_UI} mode="dark" />
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 bg-bg/95 backdrop-blur border-t border-line flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={!changed || saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Guardando…' : 'Guardar y publicar'}
        </button>
        {changed && (
          <button type="button" onClick={() => setDraft(saved)} className="btn-ghost">
            Deshacer cambios
          </button>
        )}
        {message && <span className="text-sm text-muted">{message}</span>}
      </div>
    </section>
  );
}

function BackupTab({ token, onRestored }) {
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState('');

  const download = async () => {
    const data = await api(`/api/v1/content?t=${Date.now()}`);
    const backup = { availableApps: data.availableApps || [], projects: data.projects || [], siteSettings: data.siteSettings || null };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kyrnforge-copia-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMessage('');
    try {
      const data = JSON.parse(await file.text());
      const apps = Array.isArray(data) ? data : data.availableApps;
      if (!Array.isArray(apps)) throw new Error();
      setPending({ name: file.name, items: unify(apps, data.projects) });
    } catch {
      setMessage('Ese archivo no es una copia válida.');
    }
  };

  const restore = async () => {
    try {
      await api('/api/v1/content', token, { availableApps: pending.items, projects: [] });
      onRestored(pending.items);
      setMessage(`Copia restaurada: ${pending.items.length} creaciones.`);
      setPending(null);
    } catch (err) {
      setMessage(`No se pudo restaurar: ${err.message}`);
    }
  };

  return (
    <section className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Copia de seguridad</h1>
        <p className="text-sm text-muted mt-1">Guarda un archivo con todo el catálogo o vuelve a una copia anterior.</p>
      </div>

      <div className="card p-5 space-y-3">
        <p className="font-medium">Descargar copia</p>
        <p className="text-sm text-muted">Un archivo .json con lo que hay publicado ahora mismo.</p>
        <button type="button" onClick={download} className="btn-ghost">
          <Download className="w-4 h-4" />
          Descargar
        </button>
      </div>

      <div className="card p-5 space-y-3">
        <p className="font-medium">Restaurar copia</p>
        <p className="text-sm text-muted">Reemplaza el catálogo publicado por el del archivo.</p>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={pick} className="hidden" />
        {pending ? (
          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-mono">{pending.name}</span> tiene {pending.items.length} creaciones:{' '}
              <span className="text-muted">{pending.items.map((i) => i.title).join(', ')}</span>
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPending(null)} className="btn-ghost">Cancelar</button>
              <button type="button" onClick={restore} className="btn-primary">Restaurar</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost">
            <Upload className="w-4 h-4" />
            Elegir archivo
          </button>
        )}
      </div>

      {message && <p className="text-sm text-muted">{message}</p>}
    </section>
  );
}

export default function ModDashboard({ navigate }) {
  const [token, setToken] = useState(readToken);
  const [tab, setTab] = useState('creaciones');
  const [items, setItems] = useState(null);
  const [settings, setSettings] = useState(null);
  const brand = useAppearance();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    document.title = 'Panel · KyrnForge';
  }, []);

  useEffect(() => {
    if (!token) return;
    api(`/api/v1/content?t=${Date.now()}`)
      .then((data) => {
        setSettings(data.siteSettings || {});
        setItems(unify(data.availableApps, data.projects));
      })
      .catch(() => setItems([]));
  }, [token]);

  const flash = (text, error = false) => {
    setStatus({ text, error });
    setTimeout(() => setStatus(null), error ? 6000 : 2500);
  };

  const save = async (next) => {
    setSaving(true);
    try {
      await api('/api/v1/content', token, { availableApps: next, projects: [] });
      setItems(next);
      flash('Guardado y publicado');
      return true;
    } catch (err) {
      if (/autorizado/i.test(err.message)) logout();
      flash(`No se pudo guardar: ${err.message}`, true);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const login = (password) => {
    try {
      localStorage.setItem(TOKEN_KEY, password);
    } catch {
      // Sin almacenamiento la sesión dura lo que la pestaña.
    }
    setToken(password);
  };

  function logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nada que limpiar.
    }
    setToken('');
    setItems(null);
  }

  if (!token) return <Login onLogin={login} />;

  const tabs = [
    ['creaciones', 'Creaciones'],
    ['apariencia', 'Apariencia'],
    ['copia', 'Copia de seguridad'],
  ];

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-semibold">
            <Logo />
            <span>Panel</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a href="/" className="text-sm text-muted hover:text-fg px-2">Ver sitio</a>
            <a
              href="/mod/skins"
              onClick={(e) => {
                e.preventDefault();
                navigate('/mod/skins');
              }}
              className="text-sm text-muted hover:text-fg px-2"
            >
              Skins
            </a>
            <ThemeToggle />
            <button type="button" onClick={logout} aria-label="Salir" title="Salir" className="w-9 h-9 rounded-lg border border-line text-muted hover:text-fg flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-6 text-sm">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`pb-3 border-b-2 transition ${tab === id ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {items === null ? (
          <p className="text-muted">Cargando…</p>
        ) : tab === 'creaciones' ? (
          <CreationsTab items={items} onSave={save} saving={saving} />
        ) : tab === 'apariencia' ? (
          <AppearanceTab
            settings={settings}
            token={token}
            onSaved={(next) => {
              setSettings(next);
              brand.update(next.appearance);
            }}
          />
        ) : (
          <BackupTab token={token} onRestored={setItems} />
        )}
      </main>

      {status && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] rounded-lg px-4 py-2.5 text-sm shadow-lg ${
            status.error ? 'bg-red-600 text-white' : 'bg-fg text-bg'
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
}
