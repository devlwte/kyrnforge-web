"""Texturas originales de KyrnForge Skins (tema de forja). Se repiten sin costuras.

Uso: python -I scripts/generar-texturas.py   (escribe en public/skins-assets/)
"""
import random
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "public" / "skins-assets"
rng = random.Random(1997)


def jitter(rgb, amount):
    d = rng.randint(-amount, amount)
    return tuple(max(0, min(255, c + d)) for c in rgb)


def piedra_de_forja(size=64):
    """Bloques de basalto de tamaños y tonos distintos, con juntas oscuras y alguna chispa de brasa."""
    img = Image.new("RGB", (size, size))
    mortar = (22, 20, 18)
    tones = [(46, 42, 38), (52, 47, 42), (40, 38, 36), (49, 45, 43), (56, 50, 44), (43, 41, 40)]
    for row in range(size // 8):
        y0 = row * 8
        widths, total = [], 0
        while total < size:
            w = rng.randint(6, 13)
            widths.append(min(w, size - total) if size - total >= 5 else w)
            total += widths[-1]
        widths[-1] -= total - size
        offset = rng.randrange(size)
        x = 0
        for w in widths:
            base = rng.choice(tones)
            for bx in range(w):
                for y in range(y0, y0 + 8):
                    px = (x + bx + offset) % size
                    if bx == 0 or y == y0:
                        img.putpixel((px, y), mortar)
                        continue
                    tone = base
                    if y == y0 + 1 or bx == 1:
                        tone = tuple(c + 7 for c in base)
                    elif y == y0 + 7 or bx == w - 1:
                        tone = tuple(c - 6 for c in base)
                    img.putpixel((px, y), jitter(tone, 3))
            x += w
    for _ in range(2):
        x, y = rng.randrange(size), rng.randrange(size)
        if img.getpixel((x, y)) != mortar:
            img.putpixel((x, y), rng.choice([(201, 104, 42), (232, 150, 46)]))
    return img


def placas_de_hierro(size=32):
    """Placas de hierro remachadas para el encabezado."""
    img = Image.new("RGB", (size, size))
    for y in range(size):
        for x in range(size):
            px, py = x % 16, y % 16
            if px == 0 or py == 0:
                color = (34, 37, 41)
            elif py == 1 or px == 1:
                color = (84, 90, 98)
            elif py == 15 or px == 15:
                color = (44, 47, 52)
            else:
                color = jitter((62, 66, 72), 4)
                if rng.random() < 0.03:
                    color = (74, 79, 86)
            img.putpixel((x, y), color)
    for cx in (3, 12):
        for cy in (3, 12):
            for (dx, dy), c in {(0, 0): (122, 129, 138), (1, 0): (98, 104, 112),
                                (0, 1): (98, 104, 112), (1, 1): (40, 43, 47)}.items():
                for ox in (0, 16):
                    for oy in (0, 16):
                        img.putpixel(((cx + dx + ox) % size, (cy + dy + oy) % size), c)
    return img


def franja_de_brasa(width=48):
    """Línea de brasa encendida bajo el encabezado."""
    rows = [(58, 20, 10), (138, 47, 18), (210, 92, 30), (240, 140, 45), (255, 200, 110), (232, 122, 42),
            (150, 52, 20), (70, 24, 12)]
    img = Image.new("RGB", (width, len(rows)))
    for y, base in enumerate(rows):
        for x in range(width):
            color = jitter(base, 10)
            if 2 <= y <= 4 and rng.random() < 0.06:
                color = (255, 226, 160)
            img.putpixel((x, y), color)
    return img


OUT.mkdir(parents=True, exist_ok=True)
piedra_de_forja().save(OUT / "piedra-forja.png")
placas_de_hierro().save(OUT / "placas-hierro.png")
franja_de_brasa().save(OUT / "franja-brasa.png")
print("texturas listas en", OUT)
