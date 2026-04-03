/**
 * Metaballs — scalar-field merges, vivid backdrop, orbit + center pull + beat kicks; repulsion,
 * dual attractor, per-blob mass, soft halo, flow-tinted edges, smoothed circuit stroke.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let hue = ((h % 360) + 360) % 360;
  s = Math.min(1, Math.max(0, s));
  l = Math.min(1, Math.max(0, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hue < 60) {
    rp = c;
    gp = x;
  } else if (hue < 120) {
    rp = x;
    gp = c;
  } else if (hue < 180) {
    gp = c;
    bp = x;
  } else if (hue < 240) {
    gp = x;
    bp = c;
  } else if (hue < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return [Math.round((rp + m) * 255), Math.round((gp + m) * 255), Math.round((bp + m) * 255)];
}

type Blob = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  /** Influences scalar falloff; keeps merges from looking identical. */
  mass: number;
};

const blobs: Blob[] = [];
let gw = 0;
let gh = 0;
let off: HTMLCanvasElement | null = null;
let img: ImageData | null = null;

function ensureGrid(width: number, height: number, descent: boolean) {
  const capGw = descent ? 72 : 120;
  const capGh = descent ? 52 : 84;
  const div = descent ? 7.5 : 6;
  const nextGw = Math.max(48, Math.min(capGw, Math.floor(width / div)));
  const nextGh = Math.max(36, Math.min(capGh, Math.floor(height / div)));
  if (gw === nextGw && gh === nextGh && off && img) return;

  gw = nextGw;
  gh = nextGh;
  off = document.createElement('canvas');
  off.width = gw;
  off.height = gh;
  img = new ImageData(gw, gh);

  blobs.length = 0;
  const n = descent ? 8 : 13;
  for (let i = 0; i < n; i++) {
    blobs.push({
      x: (0.15 + ((i * 7.3) % 70) / 100) * gw,
      y: (0.12 + ((i * 11.1) % 76) / 100) * gh,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      phase: Math.random() * Math.PI * 2,
      mass: 0.72 + Math.random() * 0.56,
    });
  }
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function drawMetaballs(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  _bufferLength: number,
  options?: VisualizerDrawOptions
): void {
  const beatPulse = options?.beatPulse ?? 0;
  const descent = options?.descentOverlayActive ?? false;

  const bassN = Math.min(1, eq.bass / 255);
  const midN = Math.min(1, eq.mid / 255);
  const highN = Math.min(1, eq.high / 255);
  const energyN = Math.min(1, eq.energy / 255);

  const cx = width / 2;
  const cy = height / 2;
  const hueA = (time * 0.06 + eq.lowMid * 0.1) % 360;
  const hueB = (hueA + 85 + midN * 40) % 360;
  const hueC = (hueA + 200 + highN * 30) % 360;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, `hsla(${hueA}, 70%, 18%, 1)`);
  bg.addColorStop(0.45, `hsla(${hueB}, 65%, 12%, 1)`);
  bg.addColorStop(1, `hsla(${hueC}, 75%, 10%, 1)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const bg2 = ctx.createRadialGradient(
    cx + Math.sin(time * 0.003) * width * 0.2,
    cy + Math.cos(time * 0.004) * height * 0.15,
    0,
    cx,
    cy,
    Math.max(width, height) * 0.55
  );
  bg2.addColorStop(0, `hsla(${hueA}, 55%, 28%, 0.45)`);
  bg2.addColorStop(0.55, `hsla(${hueB}, 50%, 16%, 0.2)`);
  bg2.addColorStop(1, 'hsla(260, 40%, 8%, 0)');
  ctx.fillStyle = bg2;
  ctx.fillRect(0, 0, width, height);

  ensureGrid(width, height, descent);
  if (!off || !img) return;

  const threshold = 0.28 - bassN * 0.1 + beatPulse * 0.04;
  const hueBase = (time * 0.1 + eq.presence * 0.08) % 360;

  const pull = 0.012 + midN * 0.035;
  const gcx = gw / 2;
  const gcy = gh / 2;
  const beatKick = beatPulse * 2.2;
  /* Weak second pull point orbiting center — same family as center pull, adds wandering bias. */
  const auxPull = pull * 0.38;
  const auxX = gcx + Math.sin(time * 0.0021 + highN * 1.7) * gw * 0.24;
  const auxY = gcy + Math.cos(time * 0.00185 + bassN * 2.2) * gh * 0.2;

  for (const b of blobs) {
    b.vx += Math.cos(time * 0.025 + b.phase) * 0.022 * (midN + 0.3);
    b.vy += Math.sin(time * 0.022 + b.phase * 1.3) * 0.022 * (midN + 0.3);
    b.vx += (gcx - b.x) * pull * 0.009;
    b.vy += (gcy - b.y) * pull * 0.009;
    b.vx += (auxX - b.x) * auxPull * 0.0065;
    b.vy += (auxY - b.y) * auxPull * 0.0065;
    b.vx += (Math.random() - 0.5) * beatKick * 0.08;
    b.vy += (Math.random() - 0.5) * beatKick * 0.08;
  }

  /* Soft mutual repulsion — stops pile-ups, stretches merge necks (same integrator as before). */
  const repel = (0.016 + beatPulse * 0.022) * (descent ? 0.78 : 1);
  const pairCut = descent ? 280 : 520;
  for (let i = 0; i < blobs.length; i++) {
    const bi = blobs[i]!;
    for (let j = i + 1; j < blobs.length; j++) {
      const bj = blobs[j]!;
      const dx = bj.x - bi.x;
      const dy = bj.y - bi.y;
      const d2 = dx * dx + dy * dy + 1.5;
      if (d2 > pairCut) continue;
      const inv = repel / d2;
      const nx = dx / Math.sqrt(d2);
      const ny = dy / Math.sqrt(d2);
      bi.vx -= nx * inv;
      bi.vy -= ny * inv;
      bj.vx += nx * inv;
      bj.vy += ny * inv;
    }
  }

  for (const b of blobs) {
    b.x += b.vx * (0.65 + energyN * 0.55 + beatPulse * 0.4);
    b.y += b.vy * (0.65 + energyN * 0.55 + beatPulse * 0.4);
    b.vx *= 0.985;
    b.vy *= 0.985;

    if (b.x < 2 || b.x > gw - 2) b.vx *= -0.92;
    if (b.y < 2 || b.y > gh - 2) b.vy *= -0.92;
    b.x = Math.max(2, Math.min(gw - 2, b.x));
    b.y = Math.max(2, Math.min(gh - 2, b.y));
  }

  const data = img.data;
  let p = 0;
  const coeff = descent
    ? 3.2 + bassN * 3.2 + beatPulse * 1.4
    : 3.8 + bassN * 4.5 + beatPulse * 2;

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      let field = 0;
      let gx = 0;
      let gy = 0;
      for (const b of blobs) {
        const dx = x - b.x;
        const dy = y - b.y;
        const r2 = dx * dx + dy * dy + 14;
        const m = b.mass;
        const inv = 1 / r2;
        const main = (coeff * m) * inv;
        /* Wider, softer lobe — richer blend zones without changing the merge recipe. */
        field += main + (coeff * m * 0.34) / (r2 + 48);
        const w = main * inv;
        gx += dx * w;
        gy += dy * w;
      }

      const edgeBand = smoothstep(threshold * 0.75, threshold * 1.35, field);
      const core = smoothstep(threshold, threshold * 2.8, field);
      const t = Math.min(1, Math.pow(field / (threshold * 3.2), 0.65));

      const flowDeg = (Math.atan2(gy, gx) * (180 / Math.PI) + 540) % 360;
      const hue = (
        hueBase +
        t * 118 +
        edgeBand * (70 + flowDeg * 0.24 * edgeBand) +
        highN * 26 +
        midN * edgeBand * 14 * Math.sin((flowDeg * Math.PI) / 180 * 2.4 + time * 0.0004)
      ) % 360;
      const sat = 0.55 + core * 0.42 + edgeBand * 0.2;
      const light =
        0.22 + t * 0.5 + edgeBand * 0.18 + energyN * 0.12 + beatPulse * 0.1 * edgeBand;
      const alpha = 0.35 + t * 0.55 + edgeBand * 0.25;

      const [r, g, bch] = hslToRgb(hue, sat, light);
      data[p] = r;
      data[p + 1] = g;
      data[p + 2] = bch;
      data[p + 3] = Math.min(255, alpha * 255);
      p += 4;
    }
  }

  const octx = off.getContext('2d');
  if (!octx) return;
  octx.putImageData(img, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.92;
  ctx.drawImage(off, 0, 0, gw, gh, 0, 0, width, height);
  ctx.restore();

  ctx.save();
  const lineA = 0.16 + highN * 0.22 + beatPulse * 0.28 + energyN * 0.08;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  const bl = blobs.length;
  const bx = (b: Blob) => (b.x / gw) * width;
  const by = (b: Blob) => (b.y / gh) * height;
  const circuit = new Path2D();
  if (bl >= 3) {
    const mid = (i: number, j: number) => {
      const bi = blobs[i % bl]!;
      const bj = blobs[j % bl]!;
      return { x: (bx(bi) + bx(bj)) * 0.5, y: (by(bi) + by(bj)) * 0.5 };
    };
    const m0 = mid(bl - 1, 0);
    circuit.moveTo(m0.x, m0.y);
    for (let i = 0; i < bl; i++) {
      const Pi = blobs[i]!;
      const mn = mid(i, i + 1);
      circuit.quadraticCurveTo(bx(Pi), by(Pi), mn.x, mn.y);
    }
    circuit.closePath();
  } else {
    for (let i = 0; i < bl; i++) {
      const b = blobs[i]!;
      const px = bx(b);
      const py = by(b);
      if (i === 0) circuit.moveTo(px, py);
      else circuit.lineTo(px, py);
    }
    circuit.closePath();
  }

  ctx.strokeStyle = `hsla(${(hueBase + 38) % 360}, 88%, 64%, ${lineA})`;
  ctx.lineWidth = 1.35 + beatPulse * 1.85 + energyN * 0.55;
  ctx.stroke(circuit);

  ctx.strokeStyle = `hsla(${(hueBase + 195 + midN * 30) % 360}, 75%, 58%, ${lineA * 0.45})`;
  ctx.lineWidth = Math.max(0.6, (1.35 + beatPulse * 1.85 + energyN * 0.55) * 0.42);
  ctx.stroke(circuit);
  ctx.restore();
}
