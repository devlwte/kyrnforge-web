// Generador de aspectos por piezas. Cada pieza pinta caras del aspecto 64x64 con letras que
// se traducen a colores de la paleta elegida (las sombras y brillos se calculan solos).
//   S piel  s sombra  P rubor  m boca      H cabello  h sombra  l brillo  b barba
//   I iris  E pestañas  W blanco           C ropa  c sombra  k brillo     A ropa 2  a sombra
//   T detalle  t brillo  u sombra          D pantalón  d sombra           F calzado  f suela
//   M metal  n metal oscuro  K negro       .  no pinta

// ---------- Colores ----------

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mul = (rgb, f) => rgb.map((c) => Math.max(0, Math.min(255, Math.round(c * f))));
const lighten = (rgb, f) => rgb.map((c) => Math.round(c + (255 - c) * f));
const mix = (a, b, f) => a.map((c, i) => Math.round(c * (1 - f) + b[i] * f));

function palette(colors) {
  const skin = hexToRgb(colors.skin), hair = hexToRgb(colors.hair), eyes = hexToRgb(colors.eyes);
  const main = hexToRgb(colors.main), second = hexToRgb(colors.second), detail = hexToRgb(colors.detail);
  const pants = hexToRgb(colors.pants), shoes = hexToRgb(colors.shoes);
  return {
    S: skin, s: mul(skin, 0.88), P: mix(skin, [255, 110, 110], 0.35), m: mul(mix(skin, [190, 60, 50], 0.55), 0.9),
    H: hair, h: mul(hair, 0.78), l: lighten(hair, 0.25), b: mul(hair, 0.7),
    I: eyes, E: mul(eyes, 0.28), W: [244, 244, 244],
    C: main, c: mul(main, 0.8), k: lighten(main, 0.22),
    A: second, a: mul(second, 0.8),
    T: detail, t: lighten(detail, 0.45), u: mul(detail, 0.72),
    D: pants, d: mul(pants, 0.85), F: shoes, f: mul(shoes, 0.65),
    M: [138, 143, 148], n: [95, 100, 104], K: [43, 43, 43],
  };
}

const NOISY = new Set('CcAaDdHhFkb');

// ---------- Regiones del aspecto ----------

const HEAD = { top: [8, 0, 8, 8], bottom: [16, 0, 8, 8], right: [0, 8, 8, 8], front: [8, 8, 8, 8], left: [16, 8, 8, 8], back: [24, 8, 8, 8] };
const BODY = { top: [20, 16, 8, 4], bottom: [28, 16, 8, 4], right: [16, 20, 4, 12], front: [20, 20, 8, 12], left: [28, 20, 4, 12], back: [32, 20, 8, 12] };

function limb(x0, y0, w, rightSide) {
  const faces = {
    top: [x0 + 4, y0, w, 4], bottom: [x0 + 4 + w, y0, w, 4],
    A: [x0, y0 + 4, 4, 12], front: [x0 + 4, y0 + 4, w, 12], B: [x0 + 4 + w, y0 + 4, 4, 12], back: [x0 + 8 + w, y0 + 4, w, 12],
  };
  return { ...faces, outer: rightSide ? faces.A : faces.B, inner: rightSide ? faces.B : faces.A };
}

const shift = (faces, dx, dy) => Object.fromEntries(Object.entries(faces).map(([k, [x, y, w, h]]) => [k, [x + dx, y + dy, w, h]]));
const mirror = (rows) => rows.map((r) => [...r].reverse().join(''));

function painter(ctx, pal, slim, seed) {
  const arm = slim ? 3 : 4;
  const arms = [limb(40, 16, arm, true), limb(32, 48, arm, false)];
  const legs = [limb(0, 16, 4, true), limb(16, 48, 4, false)];
  const img = ctx.getImageData(0, 0, 64, 64);

  const paint = ([x0, y0, w, h], rows) => {
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      if (!row) continue;
      for (let x = 0; x < w; x++) {
        const ch = row[x];
        if (!ch || ch === '.') continue;
        let rgb = pal[ch];
        if (!rgb) continue;
        if (NOISY.has(ch)) {
          const n = ((((x0 + x) * 73856093) ^ ((y0 + y) * 19349663) ^ seed) >>> 0) % 9 - 4;
          rgb = rgb.map((c) => Math.max(0, Math.min(255, c + n)));
        }
        const i = ((y0 + y) * 64 + x0 + x) * 4;
        img.data.set([rgb[0], rgb[1], rgb[2], 255], i);
      }
    }
  };
  const sides = (faces, face, rows) => {
    if (face === 'side') { paint(faces.right, rows); paint(faces.left, mirror(rows)); } else paint(faces[face], rows);
  };
  const limbs = (list, face, rows) => {
    for (const f of list) {
      if (face === 'all') for (const k of ['outer', 'front', 'inner', 'back']) paint(f[k], rows);
      else if (face === 'sides') { paint(f.outer, rows); paint(f.inner, rows); } else paint(f[face], rows);
    }
  };
  return {
    head: (face, rows) => sides(HEAD, face, rows),
    hat: (face, rows) => sides(shift(HEAD, 32, 0), face, rows),
    body: (face, rows) => sides(BODY, face, rows),
    arms: (face, rows) => limbs(arms, face, rows),
    legs: (face, rows) => limbs(legs, face, rows),
    done: () => ctx.putImageData(img, 0, 0),
  };
}

const fill = (w, h, ch) => Array(h).fill(ch.repeat(w));
const blank = (n, w = 8) => Array(n).fill('.'.repeat(w));

// ---------- Piezas ----------

export const PARTS = {
  eyes: {
    normales: { label: 'Normales', paint: (p) => p.head('front', [...blank(3), '.hh..hh.', '.WI..IW.', '...ss...', '...mm...']) },
    anime: { label: 'Anime', paint: (p) => p.head('front', [...blank(4), '.EE..EE.', '.IW..WI.', '.P....P.', '....m...']) },
    serios: { label: 'Serios', paint: (p) => p.head('front', [...blank(3), 'hhh..hhh', '.EI..IE.', '...ss...', '..mmmm..']) },
  },
  hair: {
    corto: { label: 'Corto', paint: (p) => shortHair(p) },
    puntas: {
      label: 'Puntas',
      paint: (p) => {
        shortHair(p);
        p.head('front', ['HHHHHHHH', 'HlHHHlHH', 'HHSHHHSH']);
        p.hat('top', ['H.H.H..H', '.HlH.lH.', 'H.HHH.HH', '.lH.HlH.', 'HH.H.HH.', '.H.lH.HH', 'H.HH.H.H', '.H..H.H.']);
        p.hat('front', ['HlH.HHlH', 'H.l..H.H', 'H......H', 'h......h']);
        p.hat('side', ['HHHHHHHH', 'HlHHHHHH', 'HHHHHHH.', 'HHHhHH..', 'HHHHH...', 'HhHH....', 'HH......', 'H.......']);
        p.hat('back', ['HHHHHHHH', 'HlHHHlHH', 'HHHHHHHH', 'HHhHHhHH', 'HHHHHHHH', 'HhHHHHhH', 'HHHHHHHH', 'H.HH.HH.']);
      },
    },
    largo: {
      label: 'Largo',
      paint: (p) => {
        shortHair(p);
        p.head('front', ['HHHHHHHH', 'HHlHHHlH', 'H......H', 'H......H', 'H......H', 'H......H', 'H......H', 'H......H']);
        p.head('side', ['HHHHHHHH', 'HHHHHHHH', 'HHHHHHH.', 'HHHHHH..', 'HHHHHH..', 'HHHHH...', 'HHHHH...', 'HHHH....']);
        p.head('back', fill(8, 8, 'H'));
        p.hat('back', ['........', '........', 'HHHHHHHH', 'HHhHHhHH', 'HHHHHHHH', 'HhHHHHhH', 'HHHHHHHH', 'hHHhHHHh']);
        p.hat('side', [...blank(3), 'HHHH....', 'HHHH....', 'HHH.....', 'HHH.....', 'HH......']);
      },
    },
    rapado: {
      label: 'Rapado',
      paint: (p) => {
        p.head('top', ['hhhHhhhh', 'hHhhhhHh', 'hhhhhhhh', 'hhHhhhhh', 'hhhhhHhh', 'hHhhhhhh', 'hhhhhhHh', 'hhhhhhhh']);
        p.head('front', ['hhhhhhhh']);
        p.head('side', ['hhhhhhhh', 'hhhhhhhh', 'hhhh....']);
        p.head('back', fill(8, 5, 'h'));
      },
    },
    calvo: { label: 'Calvo', paint: () => {} },
  },
  facial: {
    ninguno: { label: 'Ninguno', paint: () => {} },
    barba: {
      label: 'Barba',
      paint: (p) => {
        p.head('front', [...blank(6), 'b......b', 'bbbbbbbb']);
        p.head('side', [...blank(6), '....bbbb', '..bbbbbb']);
        p.head('bottom', fill(8, 8, 'b'));
      },
    },
    bigote: { label: 'Bigote', paint: (p) => p.head('front', [...blank(6), '..bbbb..', '...mm...']) },
  },
  accessory: {
    ninguno: { label: 'Ninguno', paint: () => {} },
    gafas: {
      label: 'Gafas de forja',
      paint: (p) => {
        for (const layer of ['head', 'hat']) {
          p[layer]('front', ['........', 'KTtKKTtK']);
          p[layer]('side', ['........', 'KKKKKKKK']);
          p[layer]('back', ['........', 'KKKMMKKK']);
        }
      },
    },
    cinta: {
      label: 'Cinta',
      paint: (p) => {
        p.hat('front', ['........', 'TTTTTTTT']);
        p.hat('side', ['........', 'TTTTTTTT']);
        p.hat('back', ['........', 'TTTuuTTT']);
      },
    },
    gorra: {
      label: 'Gorra',
      paint: (p) => {
        p.hat('top', ['AAAAAAAA', 'AaAAAAaA', 'AAAAAAAA', 'AAATTAAA', 'AAATTAAA', 'AAAAAAAA', 'AaAAAAaA', 'AAAAAAAA']);
        p.hat('front', ['AAATTAAA', 'aAAAAAAa']);
        p.hat('side', ['AAAAAAAA', 'aAAAAAAA']);
        p.hat('back', ['AAAAAAAA', 'aAAAAAAa']);
      },
    },
    casco: {
      label: 'Casco espacial',
      helmet: true,
      paint: (p) => {
        p.head('front', ['cCCCCCCc', 'CCkkkkCC', 'CuTTTTuC', 'CTtTTTTC', 'CuTTTTuC', 'CCnCCnCC', 'CcCCCCcC', 'cCCCCCCc']);
        p.head('side', ['cCCCCCCc', 'CCCCCkCC', 'CCCCCCuC', 'CCCMMCTC', 'CCCMMCuC', 'CCCCCCCC', 'CcCCCCcC', 'cCCCCCCc']);
        p.head('back', ['cCCCCCCc', 'CCCkkCCC', 'CCcCCcCC', 'CCCCCCCC', 'CcCnnCcC', 'CCCnnCCC', 'CcCCCCcC', 'cCCCCCCc']);
        p.head('top', ['cCCCCCCc', ...Array(6).fill('CCCkkCCC'), 'cCCCCCCc']);
        p.head('bottom', fill(8, 8, 'A'));
        p.hat('front', ['........', '........', '.uTTTTu.', '.TtTTTT.', '.uTTTTu.']);
      },
    },
  },
  top: {
    camiseta: {
      label: 'Camiseta',
      paint: (p) => {
        p.body('front', ['CCCSSCCC', 'CCCCCCCC', 'CkCCCCkC', 'CCCCCCCC', 'CCCCCCCC', 'CCCCCCCC', 'CcCCCCcC', 'cCCCCCCc']);
        p.body('back', ['CCCCCCCC', 'CCCCCCCC', 'CkCCCCkC', 'CCCCCCCC', 'CCCCCCCC', 'CCcCCcCC', 'CCCCCCCC', 'cCCCCCCc']);
        p.body('side', [...fill(4, 7, 'C'), 'cCCc']);
        p.body('top', fill(8, 4, 'C'));
        p.arms('all', ['CCCC', 'CCCC', 'CkCC', 'cCCc', 'SSSS', 'SSSS', 'SSSS', 'SsSS', 'SSSS', 'SSSS', 'SSSS', 'sSSs']);
        p.arms('top', fill(4, 4, 'C'));
      },
    },
    uniforme: {
      label: 'Uniforme',
      paint: (p) => {
        p.body('front', ['CWWWWWWC', 'CCWTTWCC', 'CCCTTCCC', 'CCCAcCCC', 'CCCccCCC', 'CCCAcCCC', 'CCCccCCC', 'KKKKKKKK']);
        p.body('back', ['CWWWWWWC', 'CCCCCCCC', 'CCCCCCCC', 'CcCCCCcC', 'CCCCCCCC', 'CCCccCCC', 'CCCCCCCC', 'KKKKKKKK']);
        p.body('side', ['CWWC', 'CCCC', 'CCCC', 'CCCC', 'CCCC', 'cCCc', 'CCCC', 'KKKK']);
        p.body('top', ['CWWWWWWC', 'CCWTTWCC', 'CCCCCCCC', 'CCCCCCCC']);
        p.arms('all', ['CCCC', 'CCCC', 'CCCC', 'CcCC', 'CCCC', 'CCCC', 'CCcC', 'CCCC', 'WWWW', 'SSSS', 'SSSS', 'sSSs']);
        p.arms('top', fill(4, 4, 'C'));
      },
    },
    delantal: {
      label: 'Delantal de forja',
      paint: (p) => {
        p.body('front', ['CASSSSAC', 'CAAAAAAC', 'CAAAAAAC', 'CAAAAAAC', 'CAAAAAAC', 'KKKTTKKK',
          'CAAAaMMC', 'CAAAaKAC', 'CAAAaKAC', 'CAAAaaAC', 'CAAAAAAC', 'CaAAAAaC']);
        p.body('back', ['CACCCCAC', 'CCACCACC', 'CCCAACCC', 'CCCAACCC', 'CCACCACC', 'KKKKKKKK', 'CCCCCCCC', 'cCCCCCCc']);
        p.body('side', ['CCCC', 'CCCC', 'ACCA', 'ACCC', 'CCCC', 'KKKK', 'CCCC', 'cCCc']);
        p.body('top', ['CAACCAAC', 'CCCCCCCC', 'CCCCCCCC', 'CAACCAAC']);
        p.arms('all', ['CCCC', 'CCCC', 'CCCc', 'CCCC', 'kkkk', 'SSSs', 'SSSs', 'SsSs', 'SSSs', 'SSSs', 'SSSS', 'sSSs']);
        p.arms('top', fill(4, 4, 'C'));
        p.legs('front', ['AAAA', 'AAAA', 'AAAA', 'aAAa']);
      },
    },
    armadura: {
      label: 'Armadura',
      paint: (p) => {
        p.body('front', ['ACCCCCCA', 'CkCCCCkC', 'CCkCCkCC', 'CCCnnCCC', 'CcCCCCcC', 'ACCCCCCA',
          'AAaAAaAA', 'AaAAAAaA', 'MMMnnMMM', 'AAAAAAAA', 'AaAAAAaA', 'AAAAAAAA']);
        p.body('back', ['ACCCCCCA', 'CCkkkkCC', 'CCnCCnCC', 'CCnCCnCC', 'CCkkkkCC', 'ACCCCCCA',
          'AAAAAAAA', 'AaAAAAaA', 'MMMMMMMM', 'AAAAAAAA', 'AaAAAAaA', 'AAAAAAAA']);
        p.body('side', ['ACCA', 'CCCC', 'CCCC', 'CCCC', 'CCCC', 'ACCA', 'AAAA', 'AaAA', 'MMMM', 'AAAA', 'AAaA', 'AAAA']);
        p.body('top', ['CCCCCCCC', 'CkkCCkkC', 'CCCCCCCC', 'CCCCCCCC']);
        p.body('bottom', fill(8, 4, 'A'));
        p.arms('all', ['CCCC', 'CkkC', 'CCCC', 'cCCc', 'AAAA', 'AaAA', 'CCCC', 'CMMC', 'CCCC', 'cCCc', 'aAAa', 'aaaa']);
        p.arms('top', fill(4, 4, 'C'));
        p.arms('bottom', fill(4, 4, 'a'));
        p.legs('front', ['CCCC', 'CkkC', 'CCCC', 'cCCc', 'AAAA', 'MMMM', 'CCCC', 'CkkC', 'CCCC']);
        p.legs('sides', ['CCCC', 'CCCC', 'CCCC', 'cCCc', 'AAAA', 'MnnM', 'CCCC', 'CCCC', 'CCCC']);
        p.legs('back', ['CCCC', 'CCCC', 'CCCC', 'cCCc', 'AAAA', 'AnnA', 'CCCC', 'CCCC', 'CCCC']);
        p.legs('top', fill(4, 4, 'A'));
      },
    },
    sudadera: {
      label: 'Sudadera',
      paint: (p) => {
        p.body('front', ['CCWccWCC', 'CCWCCWCC', 'CCCCCCCC', 'CkCCCCkC', 'CCCCCCCC', 'CCccccCC', 'CCcCCcCC', 'cCCCCCCc']);
        p.body('back', ['CccccccC', 'CCccccCC', 'CCCccCCC', 'CCCCCCCC', 'CCCCCCCC', 'CCCCCCCC', 'CCCCCCCC', 'cCCCCCCc']);
        p.body('side', [...fill(4, 7, 'C'), 'cCCc']);
        p.body('top', ['CccccccC', 'CCCCCCCC', 'CCCCCCCC', 'CCCCCCCC']);
        p.arms('all', ['CCCC', 'CCCC', 'CkCC', 'CCCC', 'CCCC', 'CCCc', 'CCCC', 'CCCC', 'CCCC', 'cccc', 'SSSS', 'sSSs']);
        p.arms('top', fill(4, 4, 'C'));
      },
    },
  },
  pants: {
    pantalon: {
      label: 'Pantalón',
      paint: (p) => {
        p.legs('all', ['DDDD', 'DDdD', 'DDDD', 'DDDD', 'DdDD', 'DDDD', 'DDDD', 'DDdD', 'DDDD', 'DDDD', 'DDDD', 'DDDD']);
        p.legs('top', fill(4, 4, 'D'));
        pantsBody(p);
      },
    },
    corto: {
      label: 'Pantalón corto',
      paint: (p) => {
        p.legs('all', ['DDDD', 'DDdD', 'DDDD', 'DDDD', 'dddd', 'SSSS', 'SSSS', 'SsSS', 'SSSS', 'SSSS', 'SSSS', 'SSSS']);
        p.legs('top', fill(4, 4, 'D'));
        pantsBody(p);
      },
    },
  },
  shoes: {
    botas: { label: 'Botas', paint: (p) => { p.legs('all', [...blank(9, 4), 'FFFF', 'FFFF', 'ffff']); p.legs('bottom', fill(4, 4, 'f')); } },
    zapatillas: { label: 'Zapatillas', paint: (p) => { p.legs('all', [...blank(9, 4), 'FFFF', 'FTTF', 'WWWW']); p.legs('bottom', fill(4, 4, 'W')); } },
    descalzo: { label: 'Descalzo', paint: (p) => p.legs('bottom', fill(4, 4, 's')) },
  },
};

function shortHair(p) {
  p.head('top', ['HHHlHHHH', 'HlHHHHlH', 'HHHHHHHH', 'HHlHHHHH', 'HHHHHlHH', 'HlHHHHHH', 'HHHHHHlH', 'HHHHHHHH']);
  p.head('front', ['HHHHHHHH', 'HHlHHHlH', 'H......H']);
  p.head('side', ['HHHHHHHH', 'HHHHHHHH', 'HHHHHH..', 'HHHHH...', 'HHHH....', 'HHH.....', 'HH......']);
  p.head('back', ['HHHHHHHH', 'HlHHHlHH', 'HHHHHHHH', 'HHhHHhHH', 'HHHHHHHH', 'HhHHHHhH', 'hHHHHHHh']);
}

function pantsBody(p) {
  p.body('front', [...blank(8), 'DDDdDDDD', 'DDDdDDDD', 'DdDdDDdD', 'DDDdDDDD']);
  p.body('back', [...blank(8), 'DDDDDDDD', 'DDDDDDDD', 'DdDDDDdD', 'DDDDDDDD']);
  p.body('side', [...blank(8, 4), 'DDDD', 'DDDD', 'DdDD', 'DDDD']);
  p.body('bottom', fill(8, 4, 'D'));
}

// ---------- Composición ----------

export const COLOR_FIELDS = [
  ['skin', 'Piel'], ['hair', 'Cabello'], ['eyes', 'Ojos'], ['main', 'Ropa'],
  ['second', 'Ropa 2'], ['detail', 'Detalle'], ['pants', 'Pantalón'], ['shoes', 'Calzado'],
];

export const PRESETS = {
  herrero: {
    label: 'Herrero', slim: false, gloves: true,
    parts: { hair: 'corto', eyes: 'normales', facial: 'barba', accessory: 'gafas', top: 'delantal', pants: 'pantalon', shoes: 'botas' },
    colors: { skin: '#c98b63', hair: '#5b2c14', eyes: '#3e8e41', main: '#3f4a55', second: '#6b4226', detail: '#e8962e', pants: '#3b3530', shoes: '#2b1b10' },
  },
  soldado: {
    label: 'Soldado espacial', slim: false, gloves: false,
    parts: { hair: 'corto', eyes: 'normales', facial: 'ninguno', accessory: 'casco', top: 'armadura', pants: 'pantalon', shoes: 'botas' },
    colors: { skin: '#c98b63', hair: '#3a2a1a', eyes: '#3b6fb0', main: '#4e5a2e', second: '#2a2c2e', detail: '#d8a13a', pants: '#2a2c2e', shoes: '#333a22' },
  },
  anime: {
    label: 'Estudiante anime', slim: true, gloves: false,
    parts: { hair: 'puntas', eyes: 'anime', facial: 'ninguno', accessory: 'ninguno', top: 'uniforme', pants: 'pantalon', shoes: 'zapatillas' },
    colors: { skin: '#f2c9a8', hair: '#3b6fd8', eyes: '#4aa3ff', main: '#22305a', second: '#e8c25a', detail: '#d33a3a', pants: '#3a3d4a', shoes: '#2b1e1e' },
  },
};

const RANDOM_COLORS = {
  skin: ['#f2c9a8', '#e0ac85', '#c98b63', '#a86f4c', '#7a4e33', '#5a3825'],
  hair: ['#1e1b18', '#3a2a1a', '#5b2c14', '#8b5a2b', '#d9b26a', '#e8e0c8', '#b03030', '#3b6fd8', '#7a3fb0', '#2e8b57'],
  eyes: ['#3b6fb0', '#3e8e41', '#6b4226', '#4aa3ff', '#8a2be2', '#c0392b', '#2b2b2b'],
  cloth: ['#22305a', '#3f4a55', '#4e5a2e', '#7a1f1f', '#2e5e4e', '#5a3e7a', '#c46a1e', '#d8d8d8', '#1f1f24', '#2f6fb0'],
  shoes: ['#2b1b10', '#1f1f24', '#2b1e1e', '#3a3d4a', '#d8d8d8'],
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function randomDesign() {
  const keys = (group) => Object.keys(PARTS[group]);
  return {
    slim: Math.random() < 0.4,
    gloves: Math.random() < 0.3,
    parts: {
      hair: pick(keys('hair')), eyes: pick(keys('eyes')), facial: Math.random() < 0.7 ? 'ninguno' : pick(keys('facial')),
      accessory: Math.random() < 0.5 ? 'ninguno' : pick(keys('accessory')), top: pick(keys('top')),
      pants: pick(keys('pants')), shoes: pick(keys('shoes')),
    },
    colors: {
      skin: pick(RANDOM_COLORS.skin), hair: pick(RANDOM_COLORS.hair), eyes: pick(RANDOM_COLORS.eyes),
      main: pick(RANDOM_COLORS.cloth), second: pick(RANDOM_COLORS.cloth), detail: pick(['#e8962e', '#d33a3a', '#e8c25a', '#55ff55', '#4aa3ff']),
      pants: pick(RANDOM_COLORS.cloth), shoes: pick(RANDOM_COLORS.shoes),
    },
  };
}

/// Dibuja el diseño y devuelve el PNG 64x64 como data URL.
export function renderDesign(design, seed = 7) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const p = painter(ctx, palette(design.colors), design.slim, seed);
  const { parts } = design;
  const helmet = PARTS.accessory[parts.accessory]?.helmet;

  // Base de piel; luego de abajo hacia arriba: pantalón, calzado, torso, guantes y cabeza.
  for (const face of ['top', 'bottom', 'side', 'front', 'back']) p.head(face, fill(8, 8, 'S'));
  for (const face of ['top', 'bottom', 'side', 'front', 'back']) p.body(face, fill(8, 12, 'S'));
  for (const face of ['all', 'top', 'bottom']) { p.arms(face, fill(4, 12, 'S')); p.legs(face, fill(4, 12, 'S')); }
  PARTS.pants[parts.pants]?.paint(p);
  PARTS.shoes[parts.shoes]?.paint(p);
  PARTS.top[parts.top]?.paint(p);
  if (design.gloves) { p.arms('all', [...blank(10, 4), 'aAAa', 'aaaa']); p.arms('bottom', fill(4, 4, 'a')); }
  if (!helmet) {
    PARTS.eyes[parts.eyes]?.paint(p);
    PARTS.hair[parts.hair]?.paint(p);
    PARTS.facial[parts.facial]?.paint(p);
  }
  PARTS.accessory[parts.accessory]?.paint(p);
  p.done();
  return canvas.toDataURL('image/png');
}
