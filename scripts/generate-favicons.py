#!/usr/bin/env python3
"""Generate favicon PNG sizes from public/favicon-source.png."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "favicon-source.png"

# Exterior matte keyed when connected to transparent pixels.
BACKGROUND_THRESHOLD = 8

# Void bunny ears + fringe — opaque so they survive favicon downscaling.
VOID_EAR_RGBA = (40, 40, 52, 255)

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
            if a == 0:
                continue
            if r > 235 and g > 235 and b > 235:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def solidify_soft_fringe(img: Image.Image) -> Image.Image:
    """Bake semi-transparent dark fringe (including ears) to opaque void tones."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0 or a == 255:
                continue
            if max(r, g, b) > 12:
                continue
            pixels[x, y] = VOID_EAR_RGBA

    return rgba


def remove_exterior_matte(img: Image.Image) -> Image.Image:
    """Remove opaque near-black only where it connects to transparent exterior."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    remove: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()
    visited: set[tuple[int, int]] = set()

    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] < 20:
                queue.append((x, y))
                visited.add((x, y))

    while queue:
        x, y = queue.popleft()
        remove.add((x, y))
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or nx >= width or ny < 0 or ny >= height:
                continue
            if (nx, ny) in visited:
                continue
            visited.add((nx, ny))
            r, g, b, a = pixels[nx, ny]
            if a < 20 or (a >= 250 and max(r, g, b) <= BACKGROUND_THRESHOLD):
                queue.append((nx, ny))

    for x, y in remove:
        pixels[x, y] = (0, 0, 0, 0)

    return rgba


def restore_void_ears(img: Image.Image, original: Image.Image) -> Image.Image:
    """
    Opaque void ears share the same color as the exterior matte and get keyed out.
    Rebuild them from the source in the top ear zones above the pink body.
    """
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    orig = original.convert("RGBA").load()
    width, height = rgba.size
    center_x = width // 2

    pink_top = height
    for y in range(height):
        for x in range(width):
            r, g, b, a = orig[x, y]
            if a > 200 and r > 150 and g < 130 and b > 100:
                pink_top = min(pink_top, y)

    ear_band_bottom = min(height, pink_top + 24)
    ear_inset = max(48, width // 9)

    for y in range(ear_band_bottom):
        for x in range(width):
            in_ear_zone = x < center_x - ear_inset or x > center_x + ear_inset
            if not in_ear_zone:
                continue

            sr, sg, sb, sa = orig[x, y]
            if sa < 20:
                continue

            is_void_tone = max(sr, sg, sb) <= 12
            if not is_void_tone:
                continue

            pixels[x, y] = VOID_EAR_RGBA

    return rgba


def prepare_source(img: Image.Image) -> Image.Image:
    keyed = key_out_white(img)
    solid = solidify_soft_fringe(keyed)
    cleared = remove_exterior_matte(solid)
    return restore_void_ears(cleared, keyed)


def render_icon(source: Image.Image, size: int) -> Image.Image:
    padding = max(1, round(size * 0.06))
    inner = size - padding * 2
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    scaled = source.copy()
    scaled.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    offset = ((size - scaled.width) // 2, (size - scaled.height) // 2)
    canvas.paste(scaled, offset, scaled)
    return canvas


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source image: {SOURCE}")

    original = Image.open(SOURCE)
    source = prepare_source(original)

    for name, size in SIZES:
        out = PUBLIC / name
        render_icon(source, size).save(out, format="PNG", optimize=True)
        print(f"Wrote {name} ({size}x{size})")

    print("Done.")


if __name__ == "__main__":
    main()
