/**
 * Neon Grid Flux — a breathing, warping neon grid that expands and pulses with the music.
 * Shallow isometric grid with counter-rotating layers, bass-driven warp, beat pulses at
 * intersections. Uses beatPulse for rhythmic hits, calm for breath modulation.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

const ISO_ANGLE = Math.PI / 6; // 30° for shallow isometric diamond grid

export function drawNeonGrid(
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

  const centerX = width / 2;
  const centerY = height / 2;
  const screenMax = Math.min(width, height) * 0.52;

  const bassScale = eq.bass / 255;
  const energyScale = eq.energy / 255;
  const highScale = eq.high / 255;

  // Intensity-driven coverage: tight when mellow, fills screen when intense
  const intensityBlend =
    energyScale * 0.35 + bassScale * 0.35 + beatPulse * 0.5 + (1 - calm) * 0.2;
  const reachFactor = 0.2 + 0.8 * Math.min(1, intensityBlend);
  const extent = screenMax * reachFactor * (1 + beatPulse * 0.15);

  // Grid density: tighter when calm, more lines when intense
  const baseSpacing = 28 + calm * 20 - energyScale * 12;
  const gridSpacing = baseSpacing * (0.9 + reachFactor * 0.3);

  // Rotation: faster when music is loud
  const spinSpeed = 0.002 + energyScale * 0.005 + beatPulse * 0.004;
  const rotCW = time * spinSpeed;
  const rotCCW = -time * spinSpeed;

  // Bass-driven warp amplitude
  const warpAmt = extent * (0.04 + bassScale * 0.12 + beatPulse * 0.06);

  // Color: hue from mids, brightness from highs and beat
  const hueBase = (time * 0.12 + eq.mid / 25) % 360;
  const saturation = 85 + highScale * 15 + beatPulse * 10;
  const alphaBase = 0.25 + energyScale * 0.2 + beatPulse * 0.25;
  const glowAlpha = 0.15 + beatPulse * 0.3 + highScale * 0.15;

  ctx.save();
  ctx.translate(centerX, centerY);

  /** Draw one set of parallel grid lines at given angle (after rotation). */
  const drawLineSet = (
    baseAngle: number,
    rotation: number,
    hueOffset: number,
    lineCount: number
  ) => {
    const angle = baseAngle + rotation;
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    const count = Math.max(12, lineCount);
    const halfCount = Math.floor(count / 2);

    for (let i = -halfCount; i <= halfCount; i++) {
      const offset = i * gridSpacing;
      const originX = offset * perpX;
      const originY = offset * perpY;

      ctx.beginPath();
      const segments = 48;
      for (let s = 0; s <= segments; s++) {
        const t = (s / segments) * 2 - 1;
        const dist = t * extent;
        const x0 = originX + dirX * dist;
        const y0 = originY + dirY * dist;

        const warp =
          warpAmt *
          Math.sin(
            (dist / extent) * 4 + time * 0.025 + i * 0.3 + (eq.lowMid / 100)
          );
        const wx = x0 + perpX * warp;
        const wy = y0 + perpY * warp;

        if (s === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }

      const hue = (hueBase + hueOffset + i * 3) % 360;
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 75%, ${glowAlpha})`;
      ctx.lineWidth = 6 + beatPulse * 4;
      ctx.stroke();
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 65%, ${alphaBase})`;
      ctx.lineWidth = 1.2 + eq.bass / 120 + beatPulse * 1.2;
      ctx.stroke();
    }
  };

  // Layer 1: lines at +30°, rotating CW
  ctx.save();
  ctx.rotate(rotCW);
  const lineCount1 = Math.floor(14 + intensityBlend * 14);
  drawLineSet(ISO_ANGLE, 0, 0, lineCount1);
  ctx.restore();

  // Layer 2: lines at -30°, rotating CCW
  ctx.save();
  ctx.rotate(rotCCW);
  const lineCount2 = Math.floor(14 + intensityBlend * 14);
  drawLineSet(-ISO_ANGLE, 0, 60, lineCount2);
  ctx.restore();

  // Beat pulses — glowing nodes that flare on transients
  if (beatPulse > 0.08 || energyScale > 0.2) {
    const pulseCount = Math.floor(10 + intensityBlend * 10);
    const pulseRadius = 5 + beatPulse * 10 + highScale * 5;
    const pulseAlpha = 0.35 + beatPulse * 0.55;

    for (let i = 0; i < pulseCount; i++) {
      const ang = (i / pulseCount) * Math.PI * 2 + time * 0.004;
      const dist = extent * (0.25 + (i % 3) * 0.25 + intensityBlend * 0.2);
      const ix = Math.cos(ang) * dist;
      const iy = Math.sin(ang) * dist;

      const hue = (hueBase + i * 35) % 360;
      const grad = ctx.createRadialGradient(ix, iy, 0, ix, iy, pulseRadius * 2);
      grad.addColorStop(0, `hsla(${hue}, 95%, 80%, ${pulseAlpha})`);
      grad.addColorStop(0.5, `hsla(${hue}, 90%, 65%, ${pulseAlpha * 0.4})`);
      grad.addColorStop(1, `hsla(${hue}, 85%, 50%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ix, iy, pulseRadius * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Radial beams when energy is high
  if (reachFactor > 0.35 && (energyScale > 0.3 || beatPulse > 0.15)) {
    const beamCount = 12 + Math.floor(intensityBlend * 12);
    const beamLen = extent * (0.5 + intensityBlend * 0.5);
    const beamAlpha = 0.1 + intensityBlend * 0.12 + beatPulse * 0.1;

    for (let i = 0; i < beamCount; i++) {
      const ang = (i / beamCount) * Math.PI * 2 + time * 0.006;
      ctx.strokeStyle = `hsla(${(hueBase + i * 30) % 360}, ${saturation}%, 70%, ${beamAlpha})`;
      ctx.lineWidth = 1.5 + beatPulse;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * beamLen, Math.sin(ang) * beamLen);
      ctx.stroke();
    }
  }

  // Central glow on beat
  const coreRadius = 20 * (1 + bassScale * 0.5 + beatPulse * 0.5);
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
  coreGrad.addColorStop(0, `hsla(${hueBase}, 90%, 75%, ${0.3 + beatPulse * 0.4})`);
  coreGrad.addColorStop(0.5, `hsla(${hueBase + 30}, 85%, 65%, ${0.15 + beatPulse * 0.2})`);
  coreGrad.addColorStop(1, `hsla(${hueBase}, 80%, 55%, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
