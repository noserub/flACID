#!/usr/bin/env python3
"""Generate favicon PNG sizes from public/favicon-source.png."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "favicon-source.png"

SIZES: list[tuple[str, int]] = [
    ("favicon-16x16.png", 16),
    ("favicon-32x32.png", 32),
    ("apple-touch-icon.png", 180),
    ("android-chrome-192x192.png", 192),
    ("android-chrome-512x512.png", 512),
]


def sample_background(img: Image.Image) -> tuple[int, int, int, int]:
    """Use the corner color as the icon canvas fill (keeps yellow matte seamless)."""
    rgba = img.convert("RGBA")
    return rgba.getpixel((0, 0))


def render_icon(source: Image.Image, size: int, bg: tuple[int, int, int, int]) -> Image.Image:
    """Scale source to fit the square canvas with a small margin so ears stay inside."""
    margin = max(1, round(size * 0.04))
    inner = size - margin * 2
    canvas = Image.new("RGBA", (size, size), bg)

    sw, sh = source.size
    scale = min(inner / sw, inner / sh)
    new_w = max(1, round(sw * scale))
    new_h = max(1, round(sh * scale))

    resampling = Image.Resampling.NEAREST if scale >= 1.0 else Image.Resampling.LANCZOS
    scaled = source.resize((new_w, new_h), resampling)

    offset = ((size - scaled.width) // 2, (size - scaled.height) // 2)
    canvas.paste(scaled, offset, scaled)
    return canvas


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source image: {SOURCE}")

    source = Image.open(SOURCE).convert("RGBA")
    bg = sample_background(source)

    for name, size in SIZES:
        out = PUBLIC / name
        render_icon(source, size, bg).save(out, format="PNG", optimize=True)
        print(f"Wrote {name} ({size}x{size})")

    print("Done.")


if __name__ == "__main__":
    main()
