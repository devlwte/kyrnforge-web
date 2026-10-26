import React, { useEffect, useState } from 'react';
import { Download, Edit3, Eye, Flag, Plus, Search, Trash2, Upload as UploadIcon } from 'lucide-react';
import { Alert, NAME_RE, Panel, Skin3D, SkinFront, api, fileToDataUrl, imageSize, useSession } from './shared.jsx';

// ---------- Galería ----------

export function Gallery({ navigate }) {
  const [skins, setSkins] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api('/api/v1/skins').then((d) => setSkins(d.skins)).catch(() => setSkins([]));
  }, []);

  const search = (e) => {
    e.preventDefault();
    if (NAME_RE.test(query)) navigate(`/skins/ver/${query}`);
  };
  const visible = (skins || []).filter((s) => !query || s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid gap-6">
      <div className="mcs-panel p-5 sm:p-8 grid gap-3">
        <h1 className="mcs-title text-2xl sm:text-4xl">Tu aspecto, también sin conexión</h1>
        <p className="text-sm sm:text-base text-[#d6d6d6] max-w-3xl">
          Publica aspectos con tus nombres de jugador. xLaunch los muestra sin conexión, en LAN y en servidores no
          premium. Los nombres premium muestran su aspecto de Mojang y no se pueden reclamar.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button className="mcs-btn green" onClick={() => navigate('/skins/subir')}><UploadIcon size={16} /> Subir aspecto</button>
          <form onSubmit={search} className="flex gap-2 flex-1 min-w-[220px] max-w-md">
            <input className="mcs-input" placeholder="Buscar un jugador" value={query} maxLength={16}
              onChange={(e) => setQuery(e.target.value.trim())} />
            <button className="mcs-btn" aria-label="Ver jugador"><Search size={16} /></button>
          </form>
        </div>
      </div>

      <Panel title="Galería">
        {skins === null ? (
          <p className="text-[#bdbdbd] text-sm">Cargando…</p>
        ) : visible.length === 0 ? (
          <p className="text-[#bdbdbd] text-sm">
            {query ? `Nadie con «${query}» en la galería. Pulsa la lupa para buscarlo también entre los premium.` : 'Todavía no hay aspectos. ¡Sé el primero!'}
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
            {visible.map((s) => (
              <button key={s.name} className="mcs-slot gap-2" onClick={() => navigate(`/skins/ver/${s.name}`)} title={`Ver ${s.name}`}>
                <SkinFront src={s.url} slim={s.model === 'slim'} scale={4} />
                <span className="truncate max-w-full">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ---------- Ver un aspecto ----------

export function Viewer({ name, navigate }) {
  const { me } = useSession();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [animation, setAnimation] = useState('walk');
  const [rotate, setRotate] = useState(true);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    setData(null);
    setError('');
    api(`/api/v1/skins/name/${encodeURIComponent(name)}`)
      .then((d) => (d.skin ? setData({ ...d.skin, source: d.source }) : setError(`«${name}» no tiene aspecto publicado.`)))
      .catch((e) => setError(e.message));
  }, [name]);

  const mine = me?.skins?.some((s) => s.name.toLowerCase() === name.toLowerCase());
  const report = async () => {
    await api('/api/v1/skins/report', { method: 'POST', body: { name, reason: 'contenido inapropiado' } }).catch(() => {});
    setReported(true);
  };

  if (error) {
    return (
      <Panel title="Aspecto no encontrado">
        <p className="text-[#d6d6d6]">{error}</p>
        <div className="flex gap-2"><button className="mcs-btn" onClick={() => navigate('/skins')}>Volver a la galería</button></div>
      </Panel>
    );
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
      <section className="mcs-panel mcs-viewer grid place-items-center p-4 min-h-[440px]">
        {data ? <Skin3D src={data.url} slim={data.model === 'slim'} width={360} height={480} animation={animation} rotate={rotate} />
          : <p className="text-[#bdbdbd]">Cargando…</p>}
      </section>
      <div className="grid gap-4 content-start">
        <Panel title={data?.name || name}>
          {data && (
            <>
              <div className="flex flex-wrap gap-2">
                <span className={`mcs-tag ${data.source === 'mojang' ? 'gold' : 'green'}`}>
                  {data.source === 'mojang' ? 'Premium (Mojang)' : 'KyrnForge Skins'}
                </span>
                <span className="mcs-tag green">{data.model === 'slim' ? 'Brazos finos' : 'Clásico'}</span>
              </div>
              <dl className="grid gap-1 text-sm">
                <dt className="mcs-label">UUID sin conexión</dt>
                <dd className="font-mono text-xs break-all text-[#d6d6d6]">{data.uuid}</dd>
                {data.updatedAt && (<><dt className="mcs-label pt-2">Actualizado</dt>
                  <dd className="text-[#d6d6d6]">{new Date(data.updatedAt).toLocaleString()}</dd></>)}
              </dl>
            </>
          )}
        </Panel>
        <Panel title="Visor">
          <div className="grid grid-cols-3 gap-2">
            {[['walk', 'Caminar'], ['run', 'Correr'], ['idle', 'Quieto']].map(([id, label]) => (
              <button key={id} className="mcs-btn" aria-pressed={animation === id} onClick={() => setAnimation(id)}>{label}</button>
            ))}
          </div>
          <button className="mcs-btn" aria-pressed={rotate} onClick={() => setRotate(!rotate)}>{rotate ? 'Girando' : 'Sin girar'}</button>
        </Panel>
        {data && (
          <Panel>
            <a className="mcs-btn" href={data.url} download={`${data.name}.png`} target="_blank" rel="noreferrer">
              <Download size={16} /> Descargar PNG
            </a>
            {mine && (
              <button className="mcs-btn green" onClick={() => navigate(`/skins/editar/${data.name}`)}><Edit3 size={16} /> Cambiar aspecto</button>
            )}
            {data.source !== 'mojang' && !mine && (
              <button className="mcs-btn" disabled={reported} onClick={report}><Flag size={16} /> {reported ? 'Denunciado' : 'Denunciar'}</button>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

// ---------- Subir o cambiar ----------

export function Upload({ editName, navigate }) {
  const { token, me, loading, refresh } = useSession();
  const editing = Boolean(editName);
  const current = editing ? me?.skins?.find((s) => s.name.toLowerCase() === editName.toLowerCase()) : null;
  const [name, setName] = useState(editName || '');
  const [slim, setSlim] = useState(false);
  const [png, setPng] = useState('');
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (current) setSlim(current.model === 'slim');
  }, [current]);

  if (loading) return <Panel><p className="text-[#bdbdbd]">Cargando…</p></Panel>;
  if (!token) {
    return (
      <Panel title="Inicia sesión">
        <p className="text-[#d6d6d6]">Necesitas una cuenta de KyrnForge para publicar aspectos.</p>
        <div><button className="mcs-btn green" onClick={() => navigate(`/skins/cuenta?next=${encodeURIComponent(window.location.pathname)}`)}>Entrar o crear cuenta</button></div>
      </Panel>
    );
  }
  if (editing && me && !current) {
    return <Panel title="No es tuyo"><p className="text-[#d6d6d6]">«{editName}» no está entre tus aspectos.</p></Panel>;
  }
  const full = !editing && me && me.skins.length >= me.limit;

  const load = async (file) => {
    if (!file) return;
    if (file.type !== 'image/png') return setMessage({ kind: 'bad', text: 'El aspecto debe ser un archivo PNG.' });
    if (file.size > 24 * 1024) return setMessage({ kind: 'bad', text: 'La imagen pesa demasiado (máximo 24 KB).' });
    const dataUrl = await fileToDataUrl(file);
    const { width, height } = await imageSize(dataUrl);
    if (width !== 64 || (height !== 64 && height !== 32)) {
      return setMessage({ kind: 'bad', text: `El aspecto debe medir 64x64; este mide ${width}x${height}.` });
    }
    setMessage(null);
    setPng(dataUrl);
  };

  const submit = async () => {
    if (!NAME_RE.test(name)) return setMessage({ kind: 'bad', text: 'El nombre debe tener de 3 a 16 caracteres: letras, números o _.' });
    if (!png && !current) return setMessage({ kind: 'bad', text: 'Elige el PNG del aspecto.' });
    setBusy(true);
    try {
      // Al editar sin elegir imagen nueva solo cambia el modelo: se reenvía la imagen actual.
      const image = png || await fileToDataUrl(await (await fetch(current.url)).blob());
      const d = await api('/api/v1/skins', { method: 'POST', token, body: { name, model: slim ? 'slim' : 'classic', png: image } });
      await refresh();
      navigate(`/skins/ver/${d.skin.name}`);
    } catch (err) {
      setMessage({ kind: 'bad', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
      <section className="mcs-panel mcs-viewer grid place-items-center p-4 min-h-[440px]">
        {png || current ? <Skin3D src={png || current.url} slim={slim} width={340} height={460} />
          : <p className="mcs-label text-center px-6">La vista previa aparece al elegir el PNG</p>}
      </section>
      <Panel title={editing ? `Cambiar «${current?.name || editName}»` : 'Subir aspecto'}>
        {full && <Alert message={{ kind: 'bad', text: `Ya tienes ${me.limit} aspectos. Borra uno en «Mis aspectos» para publicar otro.` }} />}
        <label className="grid gap-1.5">
          <span className="mcs-label">Nombre de jugador</span>
          <input className="mcs-input" maxLength={16} value={name} disabled={editing} placeholder="Ej. Herrero_99"
            onChange={(e) => setName(e.target.value.trim())} />
          {!editing && <span className="text-xs text-[#8a8a8a]">Usa este mismo nombre en xLaunch. Los premium no se pueden reclamar.</span>}
        </label>
        <div className="grid gap-1.5">
          <span className="mcs-label">Modelo</span>
          <div className="grid grid-cols-2 gap-2">
            <button className="mcs-btn" aria-pressed={!slim} onClick={() => setSlim(false)}>Clásico</button>
            <button className="mcs-btn" aria-pressed={slim} onClick={() => setSlim(true)}>Brazos finos</button>
          </div>
        </div>
        <label className={`mcs-drop ${over ? 'over' : ''} grid place-items-center gap-2 p-6 cursor-pointer text-center`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); load(e.dataTransfer.files?.[0]); }}>
          <UploadIcon size={22} />
          <span className="mcs-label">{png ? 'PNG listo · elegir otro' : 'Arrastra aquí tu PNG o pulsa para elegirlo'}</span>
          <span className="text-xs text-[#8a8a8a]">64x64 · máximo 24 KB</span>
          <input type="file" accept="image/png" className="hidden" onChange={(e) => { load(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        <Alert message={message} />
        <button className="mcs-btn green big" disabled={busy || full} onClick={submit}>{busy ? 'Publicando…' : editing ? 'Guardar cambios' : 'Publicar'}</button>
      </Panel>
    </div>
  );
}

// ---------- Mis aspectos ----------

export function MySkins({ navigate }) {
  const { token, me, loading, refresh } = useSession();
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(null);

  if (loading) return <Panel><p className="text-[#bdbdbd]">Cargando…</p></Panel>;
  if (!token || !me) {
    return (
      <Panel title="Mis aspectos">
        <p className="text-[#d6d6d6]">Inicia sesión para ver y gestionar tus aspectos.</p>
        <div><button className="mcs-btn green" onClick={() => navigate('/skins/cuenta?next=/skins/mis-skins')}>Entrar o crear cuenta</button></div>
      </Panel>
    );
  }

  const remove = async (name) => {
    try {
      await api(`/api/v1/skins?name=${encodeURIComponent(name)}`, { method: 'DELETE', token });
      setConfirm('');
      setMessage({ kind: 'ok', text: `«${name}» borrado; el nombre queda libre.` });
      refresh();
    } catch (err) {
      setMessage({ kind: 'bad', text: err.message });
    }
  };

  return (
    <Panel title={`Mis aspectos (${me.skins.length}/${me.limit})`}>
      <Alert message={message} />
      {me.skins.length === 0 ? (
        <p className="text-[#d6d6d6]">Todavía no has publicado ningún aspecto.</p>
      ) : (
        <div className="grid gap-2">
          {me.skins.map((s) => (
            <div key={s.name} className="mcs-panel p-3 flex flex-wrap items-center gap-4">
              <SkinFront src={s.url} slim={s.model === 'slim'} scale={2} />
              <div className="flex-1 min-w-[140px]">
                <p className="mcs-title">{s.name}</p>
                <p className="text-xs text-[#8a8a8a]">{s.model === 'slim' ? 'Brazos finos' : 'Clásico'} · {new Date(s.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="mcs-btn" onClick={() => navigate(`/skins/ver/${s.name}`)} title="Ver"><Eye size={16} /></button>
                <button className="mcs-btn" onClick={() => navigate(`/skins/editar/${s.name}`)}><Edit3 size={16} /> Cambiar</button>
                {confirm === s.name ? (
                  <>
                    <button className="mcs-btn red" onClick={() => remove(s.name)}>Borrar de verdad</button>
                    <button className="mcs-btn" onClick={() => setConfirm('')}>Cancelar</button>
                  </>
                ) : (
                  <button className="mcs-btn" onClick={() => setConfirm(s.name)} title="Borrar"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <button className="mcs-btn green" disabled={me.skins.length >= me.limit} onClick={() => navigate('/skins/subir')}>
          <Plus size={16} /> Subir otro
        </button>
      </div>
    </Panel>
  );
}

// ---------- Cuenta ----------

export function Account({ navigate }) {
  const { me, setToken, logout } = useSession();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const next = new URLSearchParams(window.location.search).get('next') || '/skins/mis-skins';

  if (me) {
    return (
      <Panel title="Tu cuenta">
        <p className="text-[#d6d6d6]">Sesión iniciada como <span className="mcs-yellow">{me.user.name}</span> ({me.user.email}).</p>
        <div className="flex flex-wrap gap-2">
          <button className="mcs-btn green" onClick={() => navigate('/skins/mis-skins')}>Mis aspectos</button>
          <button className="mcs-btn" onClick={logout}>Cerrar sesión</button>
        </div>
      </Panel>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const body = mode === 'login' ? { email: form.email, password: form.password } : form;
      const d = await api(`/api/v1/auth/${mode}`, { method: 'POST', body });
      setToken(d.token);
      navigate(next.startsWith('/skins') ? next : '/skins/mis-skins');
    } catch (err) {
      setMessage({ kind: 'bad', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <Panel title={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}>
        <div className="grid grid-cols-2 gap-2">
          <button className="mcs-btn" aria-pressed={mode === 'login'} onClick={() => setMode('login')}>Entrar</button>
          <button className="mcs-btn" aria-pressed={mode === 'register'} onClick={() => setMode('register')}>Crear cuenta</button>
        </div>
        <form onSubmit={submit} className="grid gap-3">
          {mode === 'register' && (
            <input className="mcs-input" placeholder="Tu nombre" autoComplete="nickname" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          )}
          <input className="mcs-input" type="email" placeholder="Correo" autoComplete="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="mcs-input" type="password" placeholder="Contraseña (mínimo 6)" value={form.password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Alert message={message} />
          <button className="mcs-btn green big" disabled={busy}>{busy ? '…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>
        </form>
        <p className="text-xs text-[#8a8a8a]">Es la misma cuenta de KyrnForge que usan las demás apps.</p>
      </Panel>
    </div>
  );
}
