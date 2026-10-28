const labelOf = (item) => (typeof item === 'object' ? item?.label || item?.name || '' : String(item || ''));

const cleanVersion = (text) => String(text || '').replace(/\s*(oficial|estable)\s*$/i, '').trim();

function normalize(entry, fromProjects) {
  const traits = (fromProjects ? entry.tags : entry.features) || [];
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description || '',
    icon: entry.iconImg || '/projects/default-app.svg',
    iconScale: entry.iconScale || '',
    category: (fromProjects ? entry.categoryLabel : entry.category) || entry.category || '',
    version: cleanVersion(fromProjects ? entry.statusLabel : entry.badge),
    system: entry.system || '',
    downloadUrl: entry.downloadUrl || (entry.repoUrl ? `${entry.repoUrl}/releases` : ''),
    repoUrl: entry.repoUrl || '',
    traits: traits
      .map((t) => ({ label: labelOf(t), description: typeof t === 'object' ? String(t.description || '').trim() : '' }))
      .filter((t) => t.label),
  };
}

/// Une las apps de descarga y el catálogo de proyectos en una sola lista sin repetidos.
/// Si un id está en ambos, manda la ficha de descarga y se completan los huecos con la del proyecto.
export function buildCatalog(apps = [], projects = []) {
  const byId = new Map();
  for (const p of projects) {
    if (p?.id) byId.set(p.id.toLowerCase(), normalize(p, true));
  }
  for (const a of apps) {
    if (!a?.id) continue;
    const key = a.id.toLowerCase();
    const fromApp = normalize(a, false);
    const fromProject = byId.get(key);
    if (!fromProject) {
      byId.set(key, fromApp);
      continue;
    }
    const merged = { ...fromProject };
    for (const [k, v] of Object.entries(fromApp)) {
      if (Array.isArray(v) ? v.length : v) merged[k] = v;
    }
    byId.set(key, merged);
  }
  return [...byId.values()];
}

export function findInCatalog(catalog, id) {
  const key = String(id || '').toLowerCase();
  return catalog.find((item) => item.id.toLowerCase() === key) || null;
}
