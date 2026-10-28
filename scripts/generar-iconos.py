"""Genera los iconos de KyrnForge (PNG, ICO, Android y SVG) a partir de src/brand.js.

Uso: python scripts/generar-iconos.py [icono] [color]
Por defecto usa el yunque con ojo y el color Acero. El resultado queda en public/brand/.
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "brand"
SS = 8  # sobremuestreo para bordes suaves

brand = (ROOT / "src" / "brand.js").read_text(encoding="utf-8")


def marks():
    found = {}
    for name, body in re.findall(r"(\w+): \{\s*name: '[^']*',\s*paths: \[([^\]]*)\]", brand):
        found[name] = re.findall(r"'([^']+)'", body)
    return found


def palette(accent_id):
    block = re.search(accent_id + r": \{.*?light: \{ accent: '(#\w+)', on: '(#\w+)' \}", brand, re.S)
    return block.group(1), block.group(2)


def subpaths(d):
    """Convierte un path con M/H/V/L/Q/Z en listas de puntos (la curva Q se muestrea)."""
    tokens = re.findall(r"[MHVLQZ]|-?\d+(?:\.\d+)?", d)
    shapes, pts, x, y, i = [], [], 0.0, 0.0, 0
    while i < len(tokens):
        cmd = tokens[i]
        i += 1
        if cmd == "M":
            x, y = float(tokens[i]), float(tokens[i + 1]); i += 2
            pts = [(x, y)]
        elif cmd == "H":
            x = float(tokens[i]); i += 1; pts.append((x, y))
        elif cmd == "V":
            y = float(tokens[i]); i += 1; pts.append((x, y))
        elif cmd == "L":
            x, y = float(tokens[i]), float(tokens[i + 1]); i += 2; pts.append((x, y))
        elif cmd == "Q":
            cx, cy, ex, ey = (float(t) for t in tokens[i:i + 4]); i += 4
            for step in range(1, 13):
                t = step / 12
                px = (1 - t) ** 2 * x + 2 * (1 - t) * t * cx + t * t * ex
                py = (1 - t) ** 2 * y + 2 * (1 - t) * t * cy + t * t * ey
                pts.append((px, py))
            x, y = ex, ey
        elif cmd == "Z":
            shapes.append(pts)
            pts = []
    return shapes


def draw_mark(draw, paths, fill, hole, scale, dx, dy):
    for d in paths:
        for n, shape in enumerate(subpaths(d)):
            pts = [(dx + px * scale, dy + py * scale) for px, py in shape]
            draw.polygon(pts, fill=fill if n == 0 else hole)


def tile(size, paths, accent, on, round_=False):
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if round_:
        draw.ellipse((0, 0, big - 1, big - 1), fill=accent)
        scale, off = big / 64 * 0.6, big * 0.2
    else:
        draw.rounded_rectangle((0, 0, big - 1, big - 1), radius=big * 15 / 64, fill=accent)
        scale, off = big / 64 * 0.71875, big * 9 / 64
    draw_mark(draw, paths, on, accent, scale, off, off)
    return img.resize((size, size), Image.LANCZOS)


def foreground(size, paths, on):
    """Capa frontal del icono adaptativo de Android: la figura dentro de la zona segura (66 de 108)."""
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    scale = big * (54 / 108) / 64
    off = (big - 64 * scale) / 2
    draw_mark(draw, paths, on, (0, 0, 0, 0), scale, off, off)
    return img.resize((size, size), Image.LANCZOS)


def svg(paths, accent, on):
    body = "".join(f'<path fill-rule="evenodd" d="{d}"/>' for d in paths)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        f'<rect width="64" height="64" rx="15" fill="{accent}"/>'
        f'<g fill="{on}" transform="translate(9 9) scale(0.71875)">{body}</g></svg>\n'
    )


def main():
    icon = sys.argv[1] if len(sys.argv) > 1 else "ojo"
    accent_id = sys.argv[2] if len(sys.argv) > 2 else "acero"
    paths = marks()[icon]
    accent, on = palette(accent_id)
    OUT.mkdir(parents=True, exist_ok=True)

    for size in (16, 32, 48, 64, 128, 180, 192, 256, 512):
        tile(size, paths, accent, on).save(OUT / f"kyrnforge-{size}.png")
    tile(512, paths, accent, on, round_=True).save(OUT / "kyrnforge-redondo-512.png")

    ico_sizes = [16, 24, 32, 48, 64, 128, 256]
    tile(256, paths, accent, on).save(OUT / "kyrnforge.ico", sizes=[(s, s) for s in ico_sizes])

    android = OUT / "android"
    android.mkdir(exist_ok=True)
    foreground(432, paths, on).save(android / "ic_launcher_foreground.png")
    Image.new("RGBA", (432, 432), accent).save(android / "ic_launcher_background.png")
    (android / "colores.json").write_text(json.dumps({"fondo": accent, "figura": on}, indent=2) + "\n", encoding="utf-8")

    mono = "".join(f'<path fill-rule="evenodd" d="{d}"/>' for d in paths)
    (OUT / "kyrnforge.svg").write_text(svg(paths, accent, on), encoding="utf-8")
    (OUT / "kyrnforge-figura.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor">{mono}</svg>\n', encoding="utf-8"
    )
    for name in ("logo.svg", "favicon.svg"):
        (ROOT / "public" / name).write_text(svg(paths, accent, on), encoding="utf-8")
    print(f"Iconos generados en {OUT} ({icon}, {accent_id})")


if __name__ == "__main__":
    main()
