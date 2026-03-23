/**
 * Breathing Mandala — layered organic breathing with counter-rotating stars, beat accents,
 * and kaleidoscope symmetry. Uses beatPulse for rhythmic hits, calm for breath modulation,
 * eq for morphing. Stars/spikes spin in opposite directions; intensity drives rotation,
 * glow, and scale.
 */

import type { EQBands, VisualizerDrawOptions } from '../types';

/** Draw a single star burst (points radiate from center). */
function drawStarBurst(
  ctx: CanvasRenderingContext2D,
  points: number,
  innerR: number,
  outerR: number,
  rotation: number,
  hue: number,
  sat: number,
  alpha: number,
  lineWidth: number
) {
  const step = (Math.PI * 2) / points;
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const ang = i * step + rotation;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = Math.cos(ang) * r;
    const y = Math.sin(ang) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = `hsla(${hue}, ${sat}%, 65%, ${alpha})`;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function drawBreathingMandala(
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
  const scale = Math.min(width, height) / 400;
  const screenMaxRadius = Math.min(width, height) * 0.52; // max reach to fill most of screen

  // Layered breathing — slow, medium, fast cycles
  const slow = Math.sin(time * 0.008) * 0.5 + 0.5;
  const medium = Math.sin(time * 0.03) * 0.5 + 0.5;
  const fast = Math.sin(time * 0.12) * 0.5 + 0.5;

  // Music-driven scale — bass expands, calm contracts
  const bassScale = eq.bass / 255;
  const energyScale = eq.energy / 255;
  const highScale = eq.high / 255;
  const breathScale = 1 + slow * 0.12 + medium * 0.06 + fast * 0.03;
  const musicScale = 1 + bassScale * 0.25 + energyScale * 0.1 - calm * 0.15;
  const pulseScale = 1 + beatPulse * 0.2;

  // Screen coverage: tight at center when mellow, fills screen when intense
  const intensityBlend = energyScale * 0.35 + bassScale * 0.35 + beatPulse * 0.5 + (1 - calm) * 0.2;
  const reachFactor = 0.18 + 0.82 * Math.min(1, intensityBlend); // 18% to 100% of screen
  const baseRadius = screenMaxRadius * reachFactor;
  const radius = baseRadius * breathScale * musicScale * pulseScale;

  // Intensity-driven rotation speed — faster when music is loud
  const spinSpeed = 0.003 + energyScale * 0.008 + beatPulse * 0.006;
  const spinCW = time * spinSpeed;
  const spinCCW = -time * spinSpeed;

  // Color breathing — hue shifts with time and energy; brighter on high freq
  const hueBase = (time * 0.15 + eq.mid / 30) % 360;
  const hueShift = beatPulse * 30;
  const saturation = 75 + energyScale * 20 + beatPulse * 15 + highScale * 15;
  const alphaBase = 0.35 + energyScale * 0.25 + beatPulse * 0.2;

  // Kaleidoscope symmetry — 8-fold
  const symmetry = 8;
  const sliceAngle = (Math.PI * 2) / symmetry;

  ctx.save();
  ctx.translate(centerX, centerY);

  // —— Radial beams — extend toward edges when intense; subtle when mellow ——
  if (reachFactor > 0.3) {
    const beamCount = 16 + Math.floor(intensityBlend * 16);
    const beamLen = screenMaxRadius * reachFactor * (0.6 + intensityBlend * 0.45);
    const beamAlpha = 0.08 + intensityBlend * 0.12 + beatPulse * 0.08;
    for (let i = 0; i < beamCount; i++) {
      const ang = (i / beamCount) * Math.PI * 2 + time * 0.008;
      ctx.strokeStyle = `hsla(${(hueBase + i * 22) % 360}, ${saturation}%, 70%, ${beamAlpha})`;
      ctx.lineWidth = 1 + intensityBlend * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * beamLen, Math.sin(ang) * beamLen);
      ctx.stroke();
    }
  }

  // —— Outer star layer (clockwise) — intensity drives size & glow ——
  ctx.save();
  ctx.rotate(spinCW);
  const starOuterR = radius * (0.7 + bassScale * 0.2 + beatPulse * 0.15);
  const starInnerR = radius * (0.25 + energyScale * 0.1);
  const starAlpha = alphaBase * (0.4 + highScale * 0.3 + beatPulse * 0.3);
  const starLineWidth = 1.5 + eq.bass / 100 + beatPulse * 1.5;
  for (let s = 0; s < symmetry; s++) {
    ctx.save();
    ctx.rotate(s * sliceAngle);
    drawStarBurst(ctx, 8, starInnerR, starOuterR, 0, (hueBase + s * 25) % 360, saturation, starAlpha, starLineWidth);
    ctx.restore();
  }
  ctx.restore();

  // —— Inner star layer (counter-clockwise) — mid/high drives size ——
  ctx.save();
  ctx.rotate(spinCCW);
  const innerStarOuterR = radius * (0.45 + eq.mid / 600 + beatPulse * 0.12);
  const innerStarInnerR = radius * (0.12 + eq.high / 800);
  const innerStarAlpha = alphaBase * (0.5 + energyScale * 0.2);
  for (let s = 0; s < symmetry; s++) {
    ctx.save();
    ctx.rotate(s * sliceAngle);
    drawStarBurst(ctx, 6, innerStarInnerR, innerStarOuterR, time * 0.002, (hueBase + 180 + s * 15) % 360, saturation, innerStarAlpha, 1 + beatPulse);
    ctx.restore();
  }
  ctx.restore();

  // Outer rings — breathe with music (subtle CW drift)
  ctx.save();
  ctx.rotate(time * 0.001);
  for (let ring = 0; ring < 5; ring++) {
    const ringRadius = radius * (0.3 + ring * 0.2) + eq.lowMid * 0.4;
    const ringBreath = 1 + slow * 0.08 * (1 - ring * 0.1);

    for (let s = 0; s < symmetry; s++) {
      ctx.save();
      ctx.rotate(s * sliceAngle);

      const segs = 24;
      ctx.beginPath();
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const angle = t * Math.PI / 2;
        const dataIdx = Math.floor((t * bufferLength) / 4) % bufferLength;
        const value = dataArray[dataIdx] || 0;
        const morphBase = radius * 0.06 + value / 8 + eq.mid / 15 + energyScale * radius * 0.08;
        const morph = Math.sin(angle * 3 + time * 0.02 + ring) * morphBase;
        const r = (ringRadius * ringBreath + morph) * (1 + beatPulse * 0.08);

        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const hue = (hueBase + s * 20 + ring * 15 + hueShift) % 360;
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 62%, ${alphaBase * (1 - ring * 0.12)})`;
      ctx.lineWidth = 2 + eq.bass / 80 + beatPulse * 2;
      ctx.stroke();

      ctx.restore();
    }
  }
  ctx.restore();

  // Inner mandala petals — morph with bass, CCW rotation (opposite to rings)
  const petalCount = 12;
  const petalBaseRadius = radius * 0.45;
  const petalPulse = 1 + bassScale * 0.4 + beatPulse * 0.3;

  for (let p = 0; p < petalCount; p++) {
    for (let s = 0; s < symmetry; s++) {
      ctx.save();
      ctx.rotate((p / petalCount) * Math.PI * 2 + s * sliceAngle - time * 0.005 * (1 + energyScale * 0.5));

      const dataIdx = Math.floor((p / petalCount) * bufferLength) % bufferLength;
      const value = dataArray[dataIdx] || 0;
      const petalLength = petalBaseRadius * petalPulse * (0.8 + value / 400 + eq.high / 600);
      const petalWidth = radius * 0.025 + eq.mid / 12 + beatPulse * radius * 0.02;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(petalWidth, petalLength * 0.5, 0, petalLength);
      ctx.quadraticCurveTo(-petalWidth, petalLength * 0.5, 0, 0);
      ctx.closePath();

      const hue = (hueBase + p * 25 + s * 10) % 360;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, petalLength, petalLength);
      grad.addColorStop(0, `hsla(${hue}, ${saturation}%, 70%, ${alphaBase * 0.9})`);
      grad.addColorStop(0.6, `hsla(${hue + 20}, ${saturation}%, 60%, ${alphaBase * 0.5})`);
      grad.addColorStop(1, `hsla(${hue}, ${saturation}%, 50%, 0)`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 65%, ${alphaBase})`;
      ctx.lineWidth = 1 + beatPulse;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Central bloom — pulses on beat; scales with overall mandala size
  const coreRadius = radius * 0.12 * (1 + bassScale * 0.5 + beatPulse * 0.4);
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
  coreGrad.addColorStop(0, `hsla(${hueBase}, 90%, 80%, ${0.8 + beatPulse * 0.2})`);
  coreGrad.addColorStop(0.4, `hsla(${hueBase + 30}, 85%, 65%, ${0.4 + energyScale * 0.3})`);
  coreGrad.addColorStop(1, `hsla(${hueBase}, 80%, 50%, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // Sparkle accents — burst from center toward edges; longer when intense
  if (beatPulse > 0.1 || highScale > 0.3) {
    const sparkCount = 8 + Math.floor(beatPulse * 4) + Math.floor(highScale * 4);
    const sparkAlpha = 0.35 + beatPulse * 0.5 + highScale * 0.25;
    const sparkReach = radius * (0.3 + intensityBlend * 0.7); // extends toward screen edge when intense
    for (let i = 0; i < sparkCount; i++) {
      const ang = (i / sparkCount) * Math.PI * 2 + time * 0.05;
      const len = sparkReach * (0.5 + beatPulse * 0.5 + eq.high / 400);
      ctx.strokeStyle = `hsla(${(hueBase + i * 40) % 360}, 90%, 90%, ${sparkAlpha})`;
      ctx.lineWidth = 1.5 + beatPulse * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
      ctx.stroke();
    }
  }

  ctx.restore();
}
