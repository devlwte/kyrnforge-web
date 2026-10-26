import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Check, RefreshCw } from 'lucide-react';

// Moderación de KyrnForge Skins. Usa la clave guardada al entrar en /mod.
export default function SkinsModeration({ onNavigateHome }) {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');
  const key = (() => {
    try { return localStorage.getItem('kyrnforge_auth_token') || ''; } catch { return ''; }
  })();

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/v1/skins/admin', { headers: { 'x-admin-key': key }, cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setReports(data.reports);
    } catch (err) {
      setError(err.message);
    }
  }, [key]);

  useEffect(() => { load(); }, [load]);

  const act = async (action, name) => {
    const res = await fetch('/api/v1/skins/admin', {
      method: 'POST',
      headers: { 'x-admin-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, name }),
    });
    if (res.ok) load();
    else setError((await res.json().catch(() => ({}))).error || 'No se pudo completar la acción.');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f1f5f9] font-sans">
      <header className="border-b border-[#1e263d] h-16 flex items-center gap-3 px-4 sm:px-6">
        <button onClick={onNavigateHome} className="p-2 rounded-lg hover:bg-[#141b2d]" aria-label="Volver a /mod">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold flex-1">Moderación de aspectos</h1>
        <button onClick={load} className="p-2 rounded-lg hover:bg-[#141b2d]" aria-label="Recargar"><RefreshCw size={18} /></button>
      </header>
      <main className="max-w-4xl mx-auto p-4 sm:p-6 grid gap-3">
        {!key && <p className="text-amber-300 text-sm">Inicia sesión primero en /mod con la clave de administrador.</p>}
        {error && <p className="text-red-300 text-sm">{error}</p>}
        {reports?.length === 0 && <p className="text-slate-400 text-sm">No hay denuncias pendientes.</p>}
        {reports?.map((r) => (
          <div key={r.name} className="rounded-xl border border-[#1e263d] bg-[#0d1322] p-4 flex items-center gap-4">
            <img src={r.skin.url} alt="" className="w-16 h-16 border border-[#1e263d]" style={{ imageRendering: 'pixelated' }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{r.name} <span className="text-xs text-red-300">· {r.count} denuncia(s)</span></p>
              <p className="text-xs text-slate-400 truncate">{[...new Set(r.reasons)].join(' · ') || 'Sin motivo'}</p>
            </div>
            <button onClick={() => act('dismiss', r.name)} className="p-2 rounded-lg border border-[#1e263d] hover:bg-[#141b2d]" title="Descartar denuncias">
              <Check size={16} />
            </button>
            <button onClick={() => act('remove', r.name)} className="p-2 rounded-lg border border-red-900 text-red-300 hover:bg-red-950/50" title="Borrar aspecto">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
