import React, { useMemo, useState } from 'react';
import { Dice5, Download, Upload as UploadIcon } from 'lucide-react';
import { Panel, Skin3D, SkinFront } from './shared.jsx';
import { COLOR_FIELDS, PARTS, PRESETS, randomDesign, renderDesign } from './generator.js';

export const DRAFT_KEY = 'kyrn_skins_draft';

const GROUPS = [
  ['top', 'Torso'], ['pants', 'Piernas'], ['shoes', 'Calzado'],
  ['hair', 'Peinado'], ['eyes', 'Ojos'], ['facial', 'Vello facial'], ['accessory', 'Accesorio'],
];

const clone = (design) => JSON.parse(JSON.stringify(design));

export function Creator({ navigate }) {
  const [design, setDesign] = useState(() => clone(PRESETS.herrero));
  const png = useMemo(() => renderDesign(design), [design]);
  const helmet = PARTS.accessory[design.parts.accessory]?.helmet;

  const setPart = (group, id) => setDesign((d) => ({ ...d, parts: { ...d.parts, [group]: id } }));
  const setColor = (field, value) => setDesign((d) => ({ ...d, colors: { ...d.colors, [field]: value } }));

  const download = () => {
    const a = document.createElement('a');
    a.href = png;
    a.download = 'aspecto-kyrnforge.png';
    a.click();
  };

  const publish = () => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ png, slim: design.slim })); } catch { /* sin almacenamiento */ }
    navigate('/skins/subir');
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
      <div className="grid gap-4 lg:sticky lg:top-28">
        <section className="mcs-panel mcs-viewer grid place-items-center p-4 min-h-[420px]">
          <Skin3D src={png} slim={design.slim} width={340} height={440} />
        </section>
        <section className="mcs-panel p-4 flex flex-wrap items-center gap-4">
          <SkinFront src={png} slim={design.slim} scale={3} />
          <img src={png} alt="Plantilla 64x64" className="w-32 h-32 border-2 border-black bg-[#111]" />
          <div className="grid gap-2 flex-1 min-w-[160px]">
            <button className="mcs-btn" onClick={() => setDesign(randomDesign())}><Dice5 size={16} /> Aleatorio</button>
            <button className="mcs-btn" onClick={download}><Download size={16} /> Descargar PNG</button>
            <button className="mcs-btn green" onClick={publish}><UploadIcon size={16} /> Publicar</button>
          </div>
        </section>
      </div>

      <div className="grid gap-4">
        <Panel title="Punto de partida">
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([id, preset]) => (
              <button key={id} className="mcs-btn" onClick={() => setDesign(clone(preset))}>{preset.label}</button>
            ))}
          </div>
        </Panel>

        <Panel title="Cuerpo">
          <div className="grid grid-cols-2 gap-2">
            <button className="mcs-btn" aria-pressed={!design.slim} onClick={() => setDesign({ ...design, slim: false })}>Clásico</button>
            <button className="mcs-btn" aria-pressed={design.slim} onClick={() => setDesign({ ...design, slim: true })}>Brazos finos</button>
          </div>
          <button className="mcs-btn" aria-pressed={design.gloves} onClick={() => setDesign({ ...design, gloves: !design.gloves })}>
            Guantes: {design.gloves ? 'sí' : 'no'}
          </button>
        </Panel>

        <Panel title="Piezas">
          {GROUPS.map(([group, label]) => {
            const disabled = helmet && ['hair', 'eyes', 'facial'].includes(group);
            return (
              <div key={group} className="grid gap-1.5">
                <span className="mcs-label">{label}{disabled ? ' (tapado por el casco)' : ''}</span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(PARTS[group]).map(([id, part]) => (
                    <button key={id} className="mcs-btn !min-h-[34px] !px-2.5 !text-[11px]" disabled={disabled}
                      aria-pressed={design.parts[group] === id} onClick={() => setPart(group, id)}>
                      {part.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </Panel>

        <Panel title="Colores">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COLOR_FIELDS.map(([field, label]) => (
              <label key={field} className="grid gap-1.5 justify-items-start">
                <span className="mcs-label">{label}</span>
                <input type="color" value={design.colors[field]} onChange={(e) => setColor(field, e.target.value)}
                  className="w-full h-10 cursor-pointer border-2 border-black bg-[#000] p-0.5" />
              </label>
            ))}
          </div>
          <p className="text-xs text-[#8a8a8a]">Las sombras y brillos de cada zona se calculan a partir de su color.</p>
        </Panel>
      </div>
    </div>
  );
}
