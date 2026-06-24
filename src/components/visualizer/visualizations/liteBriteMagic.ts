/**
 * Lite-Brite Magic — dark peg board; hearts, mushrooms, rainbows, etc. are made of
 * small glowing peg-dots (classic Lite-Brite). Spawn → dwell → explode → respawn.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

type ShapeKind = 0 | 1 | 2 | 3 | 4 | 5;

interface PegSample {
  lx: number;
  ly: number;
  hue: number;
  pr: number;
  /** True for classic rainbow arcs — avoids additive blend that collapses colors to white. */
  rainbowStripe?: boolean;
}

function fract(x: number): number {
  return x - Math.floor(x);
}

function hash2(i: number, gen: number): [number, number] {
  const s = i * 127.1 + gen * 739.287 + 311.7;
  const u = fract(Math.sin(s) * 43758.5453123);
  const v = fract(Math.sin(s * 1.234 + 19.19) * 24634.63125);
  return [u, v];
}

function smoothstep(lo: number, hi: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

/** Cubic Bézier for evenly-spaced peg outline (heart uses same style as other motifs). */
function cubicPt(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  t: number
): [number, number] {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const x = uu * u * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + tt * t * p3[0];
  const y = uu * u * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + tt * t * p3[1];
  return [x, y];
}

/** One glowing peg. Rainbow stripes use normal alpha (no `lighter`) so bands stay visibly separate. */
function drawPeg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pegR: number,
  hue: number,
  lit: number,
  beatPulse: number,
  alphaMul: number,
  rainbowStripe = false
): void {
  if (alphaMul < 0.01) return;

  const a = alphaMul;

  if (rainbowStripe) {
    const glowR = pegR * (1.42 + beatPulse * 0.18 + lit * 0.15);
    const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    const L = 56 + lit * 14;
    g.addColorStop(0, `hsla(${hue}, 100%, ${Math.min(88, L + 22)}%, ${0.97 * a})`);
    g.addColorStop(0.22, `hsla(${hue}, 100%, ${L}%, ${0.9 * a})`);
    g.addColorStop(0.45, `hsla(${hue}, 96%, ${L - 14}%, ${0.62 * a})`);
    g.addColorStop(0.72, `hsla(${hue}, 92%, ${L - 22}%, ${0.28 * a})`);
    g.addColorStop(1, `hsla(${hue}, 88%, 40%, 0)`);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${hue}, 100%, 92%, ${0.38 * a})`;
    ctx.beginPath();
    ctx.arc(x, y - pegR * 0.1, pegR * 0.22, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const glowR = pegR * (2.35 + beatPulse * 0.45 + lit * 0.35);
  const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  g.addColorStop(0, `rgba(255,255,255,${0.88 * a})`);
  g.addColorStop(0.12, `rgba(255,255,255,${0.35 * a})`);
  g.addColorStop(0.28, `hsla(${hue}, 100%, ${78 + lit * 12}%, ${0.92 * a})`);
  g.addColorStop(0.5, `hsla(${hue}, 95%, 52%, ${0.48 * a})`);
  g.addColorStop(0.75, `hsla(${hue}, 90%, 40%, ${0.16 * a})`);
  g.addColorStop(1, `hsla(${hue}, 85%, 35%, 0)`);

  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  ctx.fillStyle = `rgba(255,255,255,${0.22 * a})`;
  ctx.beginPath();
  ctx.arc(x, y - pegR * 0.12, pegR * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function sampleDots(kind: ShapeKind, size: number, hueBase: number, seed: number): PegSample[] {
  const out: PegSample[] = [];
  const j = (k: number) => 0.85 + fract(Math.sin(seed + k * 17.13) * 9999) * 0.35;
  const hJitter = (k: number) => (fract(Math.sin(seed * 2.1 + k * 31.7) * 7777) - 0.5) * 16;

  if (kind === 0) {
    /** Symmetric heart from two cubics — even peg spacing, scale matches star (~0.44·size half-width). */
    const n = 58;
    const s = size * 0.98;
    const topY = 0.45 * s;
    const dipY = -0.35 * s;
    const p0: [number, number] = [0, topY];
    const p1: [number, number] = [-0.55 * s, 0.12 * s];
    const p2: [number, number] = [-0.55 * s, -0.42 * s];
    const p3: [number, number] = [0, dipY];
    const q1: [number, number] = [0.55 * s, -0.42 * s];
    const q2: [number, number] = [0.55 * s, 0.12 * s];
    for (let k = 0; k < n; k++) {
      const t = n > 1 ? k / (n - 1) : 0;
      let pt: [number, number];
      if (t < 0.5) {
        pt = cubicPt(p0, p1, p2, p3, t * 2);
      } else {
        pt = cubicPt(p3, q1, q2, p0, (t - 0.5) * 2);
      }
      out.push({
        lx: pt[0],
        ly: pt[1],
        hue: (hueBase + hJitter(k)) % 360,
        pr: j(k),
      });
    }
  } else if (kind === 1) {
    const capN = 36;
    for (let k = 0; k < capN; k++) {
      const u = (k / capN) * Math.PI * 2;
      const rx = size * 0.48;
      const ry = size * 0.32;
      out.push({
        lx: Math.cos(u) * rx,
        ly: -0.06 * size + Math.sin(u) * ry,
        hue: (hueBase + hJitter(k) * 0.6) % 360,
        pr: j(k),
      });
    }
    const cols = 4;
    const rows = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = (c / (cols - 1) - 0.5) * size * 0.26;
        const py = 0.12 * size + (r / (rows - 1)) * size * 0.38;
        out.push({
          lx: px,
          ly: py,
          hue: (hueBase + 4 + hJitter(r * cols + c)) % 360,
          pr: j(r * cols + c) * 0.95,
        });
      }
    }
  } else if (kind === 2) {
    const points = 5;
    const outer = size * 0.44;
    const inner = outer * 0.42;
    const verts: [number, number][] = [];
    for (let i = 0; i < points * 2; i++) {
      const rad = i % 2 === 0 ? outer : inner;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      verts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
    verts.push(verts[0]!);
    const perEdge = 5;
    for (let e = 0; e < points * 2; e++) {
      const a = verts[e]!;
      const b = verts[e + 1]!;
      for (let s = 0; s < perEdge; s++) {
        const t = s / perEdge;
        const k = e * perEdge + s;
        out.push({
          lx: a[0] + (b[0] - a[0]) * t,
          ly: a[1] + (b[1] - a[1]) * t,
          hue: (hueBase + hJitter(k)) % 360,
          pr: j(k),
        });
      }
    }
  } else if (kind === 3) {
    /** Classic rainbow — seven discrete hues, pegs grouped band-by-band along nested arcs (stripes “locked” together). */
    const BAND_HUES = [0, 26, 52, 120, 210, 258, 292] as const;
    const bandCount = BAND_HUES.length;
    const pegsPerBand = 11;
    const innerR = size * 0.22;
    const outerR = size * 0.6;
    for (let b = 0; b < bandCount; b++) {
      const tBand = bandCount > 1 ? b / (bandCount - 1) : 0;
      const rr = innerR + tBand * (outerR - innerR);
      const lockedHue = BAND_HUES[b]!;
      for (let k = 0; k < pegsPerBand; k++) {
        const u = pegsPerBand > 1 ? k / (pegsPerBand - 1) : 0.5;
        const theta = Math.PI * (1.04 + u * 0.92);
        const kAll = b * pegsPerBand + k;
        out.push({
          lx: Math.cos(theta) * rr,
          ly: 0.1 * size + Math.sin(theta) * rr,
          hue: lockedHue,
          pr: j(kAll) * 0.88,
          rainbowStripe: true,
        });
      }
    }
    /* Slight second-row pegs per band so stripes feel solid / “snapped together” along each arc */
    for (let b = 0; b < bandCount; b++) {
      const tBand = bandCount > 1 ? b / (bandCount - 1) : 0;
      const rr = innerR + tBand * (outerR - innerR) + size * 0.022;
      const lockedHue = BAND_HUES[b]!;
      for (let k = 0; k < pegsPerBand - 1; k++) {
        const u = (k + 0.5) / (pegsPerBand - 1);
        const theta = Math.PI * (1.04 + u * 0.92);
        const kAll = 200 + b * pegsPerBand + k;
        out.push({
          lx: Math.cos(theta) * Math.min(rr, outerR + size * 0.04),
          ly: 0.1 * size + Math.sin(theta) * Math.min(rr, outerR + size * 0.04),
          hue: lockedHue,
          pr: j(kAll) * 0.84,
          rainbowStripe: true,
        });
      }
    }
  } else if (kind === 4) {
    const outerR = size * 0.38;
    const steps = 22;
    for (let k = 0; k < steps; k++) {
      const ang = -Math.PI * 0.78 + (k / (steps - 1)) * Math.PI * 1.56;
      out.push({
        lx: Math.cos(ang) * outerR + 0.04 * size,
        ly: Math.sin(ang) * outerR + 0.04 * size,
        hue: (hueBase + hJitter(k)) % 360,
        pr: j(k),
      });
    }
    const innerSteps = 14;
    const innerR = size * 0.3;
    const cx = -0.1 * size;
    const cy = 0.04 * size;
    for (let k = 0; k < innerSteps; k++) {
      const ang = Math.PI * 0.85 - (k / (innerSteps - 1)) * Math.PI * 1.7;
      out.push({
        lx: cx + Math.cos(ang) * innerR,
        ly: cy + Math.sin(ang) * innerR,
        hue: (hueBase + 8 + hJitter(k + 50)) % 360,
        pr: j(k + 50) * 0.85,
      });
    }
  } else {
    const arms = 8;
    const per = 4;
    for (let a = 0; a < arms; a++) {
      const ang = (a / arms) * Math.PI * 2;
      for (let s = 1; s <= per; s++) {
        const dist = (s / per) * size * 0.42;
        const k = a * per + s;
        out.push({
          lx: Math.cos(ang) * dist,
          ly: Math.sin(ang) * dist,
          hue: (hueBase + hJitter(k)) % 360,
          pr: j(k),
        });
      }
    }
    out.push({ lx: 0, ly: 0, hue: (hueBase + 30) % 360, pr: 1.15 });
  }

  return out;
}

function drawCluster(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  rot: number,
  scaleMul: number,
  appearEase: number,
  dots: PegSample[],
  basePegR: number,
  lit: number,
  beatPulse: number,
  alphaMul: number,
  explodeT: number,
  explodeSeed: number,
  size: number
): void {
  const n = dots.length;
  for (let d = 0; d < n; d++) {
    const dot = dots[d]!;
    let lx = dot.lx * scaleMul;
    let ly = dot.ly * scaleMul;

    let wx = bx + Math.cos(rot) * lx - Math.sin(rot) * ly;
    let wy = by + Math.sin(rot) * lx + Math.cos(rot) * ly;

    let dotAlpha = alphaMul;
    if (appearEase < 1) {
      dotAlpha *= smoothstep(0, 1, appearEase * 1.15 - (d / n) * 0.55);
    }

    if (explodeT > 0.001) {
      const burst =
        Math.atan2(dot.ly, dot.lx) +
        fract(explodeSeed + d * 19.17) * Math.PI * 1.1 +
        explodeT * 2.8;
      const dist = explodeT * size * (1.35 + fract(d * 13.7 + explodeSeed) * 1.1 + beatPulse * 0.5);
      wx += Math.cos(burst) * dist;
      wy += Math.sin(burst) * dist;
      dotAlpha *= (1 - explodeT) ** 1.35;
    }

    const pegR = basePegR * dot.pr;
    drawPeg(ctx, wx, wy, pegR, dot.hue, lit, beatPulse, dotAlpha, dot.rainbowStripe === true);
  }
}

export function drawLiteBriteMagic(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number,
  options?: VisualizerDrawOptions
): void {
  const beatPulse = options?.beatPulse ?? 0;
  const calm = options?.calm ?? 0.5;
  const descent = options?.descentOverlayActive ?? false;

  const t = time * 0.0165;
  const bassN = eq.bass / 255;
  const energyN = eq.energy / 255;
  const midN = eq.mid / 255;
  const highN = eq.high / 255;

  const hueShift = (time * 0.22 + midN * 42 + highN * 30) % 360;
  const wobble = (4 + bassN * 18 + beatPulse * 22) * (0.6 + (1 - calm) * 0.4);

  const margin = Math.min(width, height) * 0.06;
  const minDim = Math.min(width, height);

  const panelGrad = ctx.createRadialGradient(
    width * 0.35,
    height * 0.25,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.75
  );
  panelGrad.addColorStop(0, '#1a0f28');
  panelGrad.addColorStop(0.45, '#100820');
  panelGrad.addColorStop(1, '#06030e');
  ctx.fillStyle = panelGrad;
  ctx.fillRect(0, 0, width, height);

  const cell = descent ? 34 : 24 + (1 - calm) * 6;
  const cols = Math.ceil(width / cell) + 2;
  const rows = Math.ceil(height / cell) + 2;
  const ox = (width - cols * cell) / 2;
  const oy = (height - rows * cell) / 2;
  const holeR = cell * 0.13;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const stagger = row % 2 ? cell * 0.5 : 0;
      const px = ox + col * cell + stagger;
      const py = oy + row * cell;
      const waveX = Math.sin(col * 0.31 + row * 0.27 + t * 2.2) * wobble * 0.18;
      const waveY = Math.cos(col * 0.29 - row * 0.33 + t * 1.9) * wobble * 0.18;
      const hx = px + waveX;
      const hy = py + waveY;

      ctx.fillStyle = 'rgba(12,10,24,0.92)';
      ctx.beginPath();
      ctx.arc(hx, hy, holeR * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(55,48,95,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(6,5,14,0.88)';
      ctx.beginPath();
      ctx.arc(hx, hy, holeR * 0.52, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const entityCount = descent ? 18 : 34 + Math.floor(energyN * 24);

  for (let i = 0; i < entityCount; i++) {
    const cycleBase = 280 + Math.floor(fract(Math.sin(i * 59.1) * 9999) * 380);
    const cycle = Math.max(220, Math.floor(cycleBase * (0.85 + calm * 0.22) - beatPulse * 35));
    const offset = Math.floor(fract(Math.cos(i * 41.7) * 8888) * cycle);
    const tick = time + offset;
    const gen = Math.floor(tick / cycle);
    const prog = (tick % cycle) / cycle;

    const [hx, hy] = hash2(i, gen);
    const bx = margin + hx * (width - 2 * margin);
    const by = margin + hy * (height - 2 * margin);

    const binIdx = Math.floor(fract(Math.sin(i * 12.9898 + gen * 91.7) * 43758.5) * bufferLength) % bufferLength;
    const bin = (dataArray[binIdx] ?? 0) / 255;

    const kind = ((i + gen * 3) % 6) as ShapeKind;
    const hue = (hueShift + i * 47 + gen * 31 + kind * 19) % 360;

    const appearEnd = 0.11;
    const dwellEnd = 0.74;
    let alphaMul = 1;
    let scaleMul = 1;
    let explodeT = 0;
    let appearEase = 1;

    if (prog < appearEnd) {
      const e = smoothstep(0, appearEnd, prog);
      scaleMul = 0.2 + e * 0.8;
      alphaMul = e * e;
      appearEase = e;
    } else if (prog < dwellEnd) {
      const dwellPhase = (prog - appearEnd) / (dwellEnd - appearEnd);
      const breathe =
        1 +
        Math.sin(t * 2.8 + i * 0.8) * 0.07 * (1 - calm) +
        bin * 0.11 +
        beatPulse * 0.12;
      scaleMul = breathe * (1 + energyN * 0.05 * Math.sin(dwellPhase * Math.PI));
      alphaMul = 1;
      appearEase = 1;
    } else {
      explodeT = smoothstep(dwellEnd, 1, prog);
      alphaMul = 1;
      appearEase = 1;
    }

    const baseSize = minDim * (0.048 + fract(Math.sin(i * 33.3) * 7777) * 0.045) * (kind === 3 ? 1.08 : 1);
    const sizeCore = baseSize * (0.94 + bin * 0.18);
    const scaleMulEffective = scaleMul;
    const visualSize = sizeCore * scaleMulEffective;
    const lit = Math.min(
      1,
      0.5 + bin * 0.45 + energyN * 0.35 + (prog > appearEnd && prog < dwellEnd ? beatPulse * 0.38 : 0)
    );

    const rot =
      fract(Math.sin(i * 17.1 + gen) * 12345) * Math.PI * 2 +
      t * 0.12 * (i % 2 === 0 ? 1 : -1) * (1 - calm * 0.5);

    const dots = sampleDots(kind, sizeCore, hue, i * 19.17 + gen * 91);
    const basePegR = Math.max(1.2, sizeCore * 0.062 * scaleMulEffective);

    if (alphaMul > 0.02 || explodeT > 0.02) {
      drawCluster(
        ctx,
        bx,
        by,
        rot * (1 - explodeT * 0.6),
        scaleMulEffective,
        appearEase,
        dots,
        basePegR,
        lit,
        beatPulse,
        alphaMul,
        explodeT,
        i * 12.17 + gen,
        visualSize
      );
    }
  }

  const ribbons = descent ? 1 : 2;
  for (let r = 0; r < ribbons; r++) {
    const phase = t * (1 + r * 0.35) + r * 1.4;
    const yBase = height * (0.22 + r * 0.38) + Math.sin(phase * 1.6) * height * 0.04;
    ctx.beginPath();
    for (let i = 0; i <= 56; i++) {
      const u = i / 56;
      const px = u * width;
      const wave =
        Math.sin(u * Math.PI * 5 + phase * 2.6 + bassN * 1.8) * (22 + highN * 28) +
        Math.sin(u * Math.PI * 8 - t * 3.2) * (10 + beatPulse * 22);
      const py = yBase + wave;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `hsla(${(hueShift + r * 55) % 360}, 88%, 55%, ${0.032 + beatPulse * 0.045 + energyN * 0.025})`;
    ctx.lineWidth = 8 + beatPulse * 10 + bassN * 5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = `hsla(${(hueShift + r * 55 + 18) % 360}, 95%, 72%, ${0.055 + highN * 0.08})`;
    ctx.lineWidth = 1.5 + highN * 2;
    ctx.stroke();
  }
}
