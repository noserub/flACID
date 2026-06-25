#!/usr/bin/env python3
"""Generate favicon PNG sizes from public/favicon-source.png."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "favicon-source.png"
VOID = (10, 10, 15)

SIZES: list[tuple[str, int]] = [
    ("favicon-16x16.png", 16),
    ("favicon-32x32.png", 32),
    ("apple-touch-icon.png", 180),
    ("android-chrome-192x192.png", 192),
    ("android-chrome-512x512.png", 512),
]


def key_out_white(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0 or (r > 235 and g > 235 and b > 235):
                pixels[x, y] = (*VOID, 255)
    return rgba


def render_icon(source: Image.Image, size: int) -> Image.Image:
    padding = max(1, round(size * 0.06))
    inner = size - padding * 2
    canvas = Image.new("RGBA", (size, size), (*VOID, 255))

    scaled = source.copy()
    scaled.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    offset = ((size - scaled.width) // 2, (size - scaled.height) // 2)
    canvas.paste(scaled, offset, scaled)
    return canvas.convert("RGB")


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source image: {SOURCE}")

    source = key_out_white(Image.open(SOURCE))

    for name, size in SIZES:
        out = PUBLIC / name
        render_icon(source, size).save(out, format="PNG", optimize=True)
        print(f"Wrote {name} ({size}x{size})")

    print("Done.")


if __name__ == "__main__":
    main()
