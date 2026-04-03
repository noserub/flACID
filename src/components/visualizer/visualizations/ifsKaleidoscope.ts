/**
 * IFS kaleidoscope — chaos-game attractor, mirrored; spectrum warps vertices, large fill, beat bursts.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

type IfsState = {
  x: number;
  y: number;
  w: number;
  h: number;
  huePhase: number;
};

let state: IfsState = { x: 0, y: 0, w: 0, h: 0, huePhase: 0 };

function resetState(width: number, height: number) {
  state = {
    x: (Math.random() - 0.5) * 0.2,
    y: (Math.random() - 0.5) * 0.2,
    w: width,
    h: height,
    huePhase: Math.random() * Math.PI * 2,
  };
}

export function drawIfsKaleidoscope(
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
  const descent = options?.descentOverlayActive ?? false;

  if (state.w !== width || state.h !== height) {
    resetState(width, height);
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const energyN = Math.min(1, eq.energy / 255);
  const bassN = Math.min(1, eq.bass / 255);
  const midN = Math.min(1, eq.mid / 255);
  const highN = Math.min(1, eq.high / 255);

  const specLow = bufferLength > 0 ? (dataArray[Math.floor(bufferLength * 0.05)] ?? 0) / 255 : 0;
  const specMid = bufferLength > 0 ? (dataArray[Math.floor(bufferLength * 0.35)] ?? 0) / 255 : 0;
  const specHigh = bufferLength > 0 ? (dataArray[Math.floor(bufferLength * 0.75)] ?? 0) / 255 : 0;

  const scale =
    Math.min(width, height) *
    (0.5 + bassN * 0.14 + energyN * 0.1 + beatPulse * 0.12 + specLow * 0.06);

  const symmetry = Math.min(14, Math.max(6, Math.floor(6 + eq.bass / 32 + beatPulse * 3 + specMid * 4)));
  const slice = (Math.PI * 2) / symmetry;

  ctx.fillStyle = `hsla(268, 38%, 5%, ${0.1 + energyN * 0.05})`;
  ctx.fillRect(0, 0, width, height);

  const spread =
    0.48 +
    bassN * 0.42 +
    beatPulse * 0.18 +
    specLow * 0.12 +
    midN * 0.08;
  const wobble =
    Math.sin(time * 0.005) * 0.1 +
    Math.sin(time * 0.019 + eq.mid * 0.025) * 0.08 +
    specMid * 0.14 * Math.sin(time * 0.031) +
    specHigh * 0.06 * Math.sin(time * 0.048 + 1.2);
  const v = [
    { x: 0, y: spread },
    { x: -spread * 0.92 + wobble, y: -spread * 0.55 },
    { x: spread * 0.92 - wobble, y: -spread * 0.55 },
  ];

  const hueBase = (time * 0.42 + eq.highMid * 0.22 + state.huePhase * 45 + beatPulse * 55) % 360;
  const rotSlow =
    time * 0.0016 * (0.55 + energyN * 1.15 + midN * 0.5) +
    beatPulse * 0.14 +
    specHigh * 0.05 * Math.sin(time * 0.0022);
  const spinSnap = beatPulse * slice * 0.38;

  const iterations = Math.floor(
    descent
      ? 900 + energyN * 1400 + beatPulse * 900 + (eq.mid / 255) * 800 + specMid * 600
      : 3200 + energyN * 5200 + beatPulse * 4800 + (eq.mid / 255) * 2800 + specMid * 2000
  );

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotSlow + spinSnap);

  for (let i = 0; i < iterations; i++) {
    const k = (Math.random() * 3) | 0;
    const vx = v[k]!.x;
    const vy = v[k]!.y;
    state.x = (state.x + vx) * 0.5;
    state.y = (state.y + vy) * 0.5;

    const r = Math.hypot(state.x, state.y);
    if (r > 1.18) continue;

    const bin = bufferLength > 0 ? dataArray[i % bufferLength] ?? 0 : 0;
    const specJ = (bin / 255) * 0.35;

    const ang = Math.atan2(state.y, state.x);
    const mag = r * scale * (1 + specJ * 0.08);

    for (let s = 0; s < symmetry; s++) {
      const a = ang + s * slice;
      const px = Math.cos(a) * mag;
      const py = Math.sin(a) * mag;

      const t = r;
      const hue = (hueBase + t * 155 + s * 22 + specJ * 30) % 360;
      const alpha =
        0.052 +
        t * 0.14 +
        energyN * 0.065 +
        beatPulse * 0.085 * (1 - t * 0.4) +
        highN * 0.04;
      const size =
        0.85 +
        (1 - t) * 2.4 +
        eq.presence / 420 +
        beatPulse * 1.8 +
        specJ * 1.2;

      ctx.fillStyle = `hsla(${hue}, 84%, ${50 + t * 26 + beatPulse * 12}%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  if (beatPulse > 0.2) {
    ctx.strokeStyle = `hsla(${(hueBase + 35) % 360}, 92%, 68%, ${0.2 + beatPulse * 0.35})`;
    ctx.lineWidth = 2 + beatPulse * 2;
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      scale * (0.94 + bassN * 0.08 + beatPulse * 0.06),
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}
