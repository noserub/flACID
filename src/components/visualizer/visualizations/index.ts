/**
 * Visualization Registry
 *
 * Maps visualization IDs to draw functions.
 */

import type { DrawVisualization, EQBands, VisualizerDrawOptions } from '../types';
import { drawOrganicFlow } from './organicFlow';
import { drawBreathingMandala } from './breathingMandala';
import { drawNeonGrid } from './neonGrid';

// Re-export for use in main component
export { drawOrganicFlow } from './organicFlow';
export { drawBreathingMandala } from './breathingMandala';
export { drawNeonGrid } from './neonGrid';

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number,
  options?: VisualizerDrawOptions
) => void;

const VISUALIZATIONS: DrawFn[] = [
  (ctx, w, h, data, eq, time, buf, opt) =>
    drawOrganicFlow(ctx, w, h, data, eq, time, buf, opt),
  drawDepthLayers,
  drawWaveformInterference,
  drawMinimalGeometric,
  drawAtmosphericNoise,
  drawKaleidoscopeFractals,
  drawLiquidPlasma,
  (ctx, w, h, data, eq, time, buf, opt) =>
    drawNeonGrid(ctx, w, h, data, eq, time, buf, opt),
  drawSpiralGalaxy,
  drawCrystalLattice,
  drawBreathingMandala,
];

export const NUM_VISUALIZATIONS = VISUALIZATIONS.length;

export function getVisualization(id: number): DrawFn {
  return VISUALIZATIONS[id % VISUALIZATIONS.length] ?? VISUALIZATIONS[0];
}

// Dampened eq response: use sqrt so small fluctuations have less impact (gentler on motion sensitivity)
const soft = (v: number) => Math.sqrt(Math.min(255, v) / 255) * 180;

function drawDepthLayers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;
  const layerConfigs = [
    { freqBand: soft(eq.subBass), hue: 190, radius: 60 * scale, count: 16 },
    { freqBand: soft(eq.bass), hue: 210, radius: 110 * scale, count: 24 },
    { freqBand: soft(eq.lowMid), hue: 230, radius: 160 * scale, count: 32 },
    { freqBand: soft(eq.mid), hue: 250, radius: 210 * scale, count: 40 },
    { freqBand: soft(eq.highMid), hue: 270, radius: 260 * scale, count: 48 },
    { freqBand: soft(eq.high), hue: 290, radius: 310 * scale, count: 56 },
    { freqBand: soft(eq.presence), hue: 310, radius: 360 * scale, count: 64 },
    { freqBand: soft(eq.energy), hue: 330, radius: 410 * scale, count: 72 },
  ];
  layerConfigs.forEach((layer, layerIndex) => {
    const depth = layerIndex / layerConfigs.length;
    const parallax = (1 - depth) * Math.sin(time * 0.0012 + layerIndex) * (28 + layer.freqBand / 25);
    const layerRadius = layer.radius + layer.freqBand * 0.25;
    const segments = layer.count;
    const rotationSpeed = 0.0015 * (layerIndex % 2 === 0 ? 1 : -1) * (1 + layer.freqBand / 400);
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + time * rotationSpeed;
      const dataIdx = Math.floor((i / segments) * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const noise = Math.sin(i * 0.6 + time * 0.012 + layerIndex * 0.4) * (6 + layer.freqBand / 80);
      const r = layerRadius + noise + (value * depth) / 55;
      const x = centerX + parallax + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      const alpha = 0.25 * (1 - depth) + (layer.freqBand / 1100) * depth;
      const size = 3 + depth * 6 + layer.freqBand / 120;
      ctx.fillStyle = `hsla(${layer.hue}, 75%, ${45 + depth * 25}%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      glowGradient.addColorStop(0, `hsla(${layer.hue}, 80%, 60%, ${alpha * 0.6})`);
      glowGradient.addColorStop(1, `hsla(${layer.hue}, 70%, 50%, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.fill();
    }
  });
  const shapeCount = Math.floor(12 + soft(eq.high) / 55);
  for (let s = 0; s < shapeCount; s++) {
    const angle = (s / shapeCount) * Math.PI * 2 + time * 0.002;
    const distAmp = 35 + soft(eq.presence) / 25;
    const distance = 180 * scale + Math.sin(time * 0.0025 + s) * distAmp;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const dataIdx = Math.floor((s / shapeCount) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const size = 25 + value / 28 + soft(eq.highMid) / 35;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 0.008 * (1 + soft(eq.energy) / 400) + s);
    for (let n = 0; n < 3; n++) {
      const nSize = size * (1 - n * 0.25);
      ctx.strokeStyle = `hsla(${250 + s * 15 + n * 30}, 80%, 65%, ${0.35 + value / 800 + soft(eq.high) / 1200 - n * 0.1})`;
      ctx.lineWidth = 2 + soft(eq.bass) / 250 - n * 0.5;
      ctx.strokeRect(-nSize / 2, -nSize / 2, nSize, nSize);
      ctx.beginPath();
      for (let t = 0; t < 3; t++) {
        const tAngle = (t / 3) * Math.PI * 2 + Math.PI / 6;
        const tx = Math.cos(tAngle) * nSize * 0.4;
        const ty = Math.sin(tAngle) * nSize * 0.4;
        if (t === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawWaveformInterference(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;
  const waves = Math.floor(10 + eq.energy / 40);
  for (let w = 0; w < waves; w++) {
    const waveOffset = (w / waves) * Math.PI * 2;
    const points = 250;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const angle = t * Math.PI * 2 + time * 0.003 * (w % 2 === 0 ? 1 : -1) * (1 + eq.presence / 150);
      const dataIdx = Math.floor(t * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const baseRadius = (120 + w * 20) * scale + eq.bass * 0.8;
      const wave1 = Math.sin(angle * 3 + time * 0.015 + waveOffset) * (35 + value / 10 + eq.mid / 12);
      const wave2 = Math.cos(angle * 5 - time * 0.02 + waveOffset) * (20 + eq.lowMid / 12);
      const wave3 = Math.sin(angle * 7 + time * 0.012) * (eq.highMid / 15);
      const wave4 = Math.cos(angle * 9 + time * 0.018 + waveOffset) * (15 + eq.high / 18);
      const r = baseRadius + wave1 + wave2 + wave3 + wave4;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const hue = 260 + w * 20;
    ctx.strokeStyle = `hsla(${hue}, 75%, 60%, ${0.25 + eq.mid / 800})`;
    ctx.lineWidth = 1.5 + eq.energy / 100;
    ctx.stroke();
    ctx.strokeStyle = `hsla(${hue + 20}, 80%, 65%, ${0.18 + eq.bass / 1400})`;
    ctx.lineWidth = 10 + eq.subBass / 30;
    ctx.stroke();
  }
  const radialPoints = Math.floor(120 + eq.high / 2);
  for (let i = 0; i < radialPoints; i++) {
    const angle = (i / radialPoints) * Math.PI * 2;
    const dataIdx = Math.floor((i / radialPoints) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const r1 = 50 * scale + eq.subBass / 8;
    const r2 = 50 * scale + value * 1.5 + Math.sin(time * 0.025 + i * 0.08) * (30 + eq.presence / 10);
    const x1 = centerX + Math.cos(angle) * r1;
    const y1 = centerY + Math.sin(angle) * r1;
    const x2 = centerX + Math.cos(angle) * r2;
    const y2 = centerY + Math.sin(angle) * r2;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, `hsla(280, 75%, 65%, 0)`);
    gradient.addColorStop(0.5, `hsla(290, 75%, 60%, ${0.3 + value / 700 + eq.highMid / 1400})`);
    gradient.addColorStop(1, `hsla(300, 70%, 55%, 0)`);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1 + eq.high / 120;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  const energyRings = Math.floor(6 + eq.energy / 50);
  for (let r = 0; r < energyRings; r++) {
    const ringPhase = time * 0.002 + r * 0.5;
    const ringRadius = (60 + r * 45) * scale + Math.sin(ringPhase) * 25;
    const ringPoints = 100;
    ctx.beginPath();
    for (let i = 0; i <= ringPoints; i++) {
      const t = i / ringPoints;
      const angle = t * Math.PI * 2;
      const dataIdx = Math.floor(t * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const rd = ringRadius + value / 15 + Math.sin(angle * 4 + ringPhase * 2) * 12;
      const x = centerX + Math.cos(angle) * rd;
      const y = centerY + Math.sin(angle) * rd;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `hsla(${275 + r * 12}, 70%, 58%, ${0.2 + eq.bass / 1200})`;
    ctx.lineWidth = 2 + eq.mid / 120;
    ctx.stroke();
  }
}

function drawMinimalGeometric(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;
  const frequencies = [eq.subBass, eq.bass, eq.lowMid, eq.mid, eq.highMid, eq.high, eq.presence];
  frequencies.forEach((freq, s) => {
    const sides = 3 + s;
    const radius = (s + 1) * 55 * scale + freq * 0.5;
    const rotationSpeed = 0.005 * (s % 2 === 0 ? 1 : -1) * (1 + eq.energy / 150);
    const dataIdx = Math.floor((s / frequencies.length) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time * rotationSpeed);
    for (let nest = 0; nest < 3; nest++) {
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + nest * Math.PI / sides;
        const pulse = Math.sin(time * 0.025 + i + nest) * (10 + freq / 50);
        const r = radius * (1 - nest * 0.15) + pulse + (value / 40);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const hue = 10 + s * 50 + nest * 20;
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.4 + freq / 800 - nest * 0.1})`;
      ctx.lineWidth = 2.5 + value / 80 + freq / 100 - nest * 0.8;
      ctx.stroke();
    }
    ctx.restore();
  });
  const orbiters = Math.floor(30 + eq.high / 10);
  for (let i = 0; i < orbiters; i++) {
    const angle = (i / orbiters) * Math.PI * 2 + time * 0.003 * (1 + eq.presence / 100);
    const orbitRadius = 200 * scale + Math.sin(time * 0.006 + i) * (40 + eq.bass / 6);
    const dataIdx = Math.floor((i / orbiters) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const x = centerX + Math.cos(angle) * orbitRadius;
    const y = centerY + Math.sin(angle) * orbitRadius;
    const size = 5 + value / 40 + eq.highMid / 30;
    const hue = 20 + i * 12;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    gradient.addColorStop(0, `hsla(${hue}, 85%, 70%, ${0.7 + value / 400 + eq.high / 800})`);
    gradient.addColorStop(1, `hsla(${hue}, 75%, 60%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < orbiters; i++) {
    if (i % 2 === 0) {
      const angle1 = (i / orbiters) * Math.PI * 2 + time * 0.003;
      const angle2 = ((i + 7) / orbiters) * Math.PI * 2 + time * 0.003;
      const orbitRadius = 200 * scale;
      const x1 = centerX + Math.cos(angle1) * orbitRadius;
      const y1 = centerY + Math.sin(angle1) * orbitRadius;
      const x2 = centerX + Math.cos(angle2) * orbitRadius;
      const y2 = centerY + Math.sin(angle2) * orbitRadius;
      ctx.strokeStyle = `hsla(${30 + i * 8}, 70%, 55%, ${0.15 + eq.mid / 1400})`;
      ctx.lineWidth = 1 + eq.mid / 100;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
  const triangleCount = Math.floor(12 + eq.energy / 25);
  for (let t = 0; t < triangleCount; t++) {
    const tAngle = (t / triangleCount) * Math.PI * 2 + time * 0.004;
    const tDist = 100 * scale + Math.sin(time * 0.008 + t) * 30;
    ctx.save();
    ctx.translate(centerX + Math.cos(tAngle) * tDist, centerY + Math.sin(tAngle) * tDist);
    ctx.rotate(tAngle + time * 0.01);
    const dataIdx = Math.floor((t / triangleCount) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const triSize = 15 + value / 30 + eq.bass / 20;
    ctx.beginPath();
    for (let p = 0; p < 3; p++) {
      const pAngle = (p / 3) * Math.PI * 2;
      const px = Math.cos(pAngle) * triSize;
      const py = Math.sin(pAngle) * triSize;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `hsla(${40 + t * 15}, 75%, 60%, ${0.35 + value / 800})`;
    ctx.lineWidth = 2 + eq.energy / 150;
    ctx.stroke();
    ctx.restore();
  }
}

function drawAtmosphericNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;
  const layers = Math.floor(60 + eq.energy / 5);
  for (let i = 0; i < layers; i++) {
    const angle = (i / layers) * Math.PI * 2 + time * 0.001 * (1 + eq.presence / 200);
    const dataIdx = Math.floor((i / layers) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const baseRadius = 30 + i * 12;
    const drift = Math.sin(time * 0.012 + i * 0.15) * (40 + eq.bass / 6);
    const radius = baseRadius + drift + eq.subBass / 6;
    const x = centerX + Math.cos(angle) * (radius + value / 5);
    const y = centerY + Math.sin(angle) * (radius + value / 5);
    const size = 40 + value / 10 + eq.bass / 5 + Math.sin(time * 0.025 + i) * (15 + eq.lowMid / 20);
    const hue = 10 + (i % 15) * 4;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    const opacity = 0.08 + value / 4000 + eq.subBass / 6000;
    gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, ${opacity})`);
    gradient.addColorStop(0.5, `hsla(${hue + 15}, 65%, 45%, ${opacity * 0.7})`);
    gradient.addColorStop(1, `hsla(${hue}, 60%, 40%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  const dustCount = Math.floor(100 + eq.high / 3);
  for (let i = 0; i < dustCount; i++) {
    const angle = (i / dustCount) * Math.PI * 2 + time * 0.002 * (1 + eq.highMid / 150);
    const wobble = Math.sin(time * 0.025 + i * 0.4) * (60 + eq.presence / 4);
    const radius = 140 * scale + wobble + (i % 5) * 50;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const dataIdx = Math.floor((i / dustCount) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const dustSize = 1.5 + value / 150 + eq.high / 120;
    const dustHue = 20 + (i % 8) * 8;
    ctx.fillStyle = `hsla(${dustHue}, 75%, 60%, ${0.25 + value / 1400 + eq.highMid / 1400})`;
    ctx.beginPath();
    ctx.arc(x, y, dustSize, 0, Math.PI * 2);
    ctx.fill();
  }
  const vortexSegments = 200;
  const vortexRotation = 0.015 * (1 + eq.mid / 120);
  ctx.beginPath();
  for (let i = 0; i <= vortexSegments; i++) {
    const t = i / vortexSegments;
    const angle = t * Math.PI * 12 + time * vortexRotation;
    const dataIdx = Math.floor(t * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const r = t * 120 * scale + Math.sin(angle * 3) * (15 + eq.bass / 20) + value / 20 + eq.subBass / 30;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = `hsla(25, 70%, 55%, ${0.25 + eq.bass / 800})`;
  ctx.lineWidth = 2 + eq.subBass / 100;
  ctx.stroke();
  ctx.strokeStyle = `hsla(30, 75%, 60%, ${0.15 + eq.bass / 1200})`;
  ctx.lineWidth = 8 + eq.subBass / 50;
  ctx.stroke();
}

function drawKaleidoscopeFractals(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;
  const maxReach = Math.max(width, height) * 0.7;
  const symmetry = Math.floor(6 + eq.bass / 40);
  for (let s = 0; s < symmetry; s++) {
    const symmetryAngle = (s / symmetry) * Math.PI * 2;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(symmetryAngle);
    const branches = Math.floor(8 + eq.mid / 30);
    for (let b = 0; b < branches; b++) {
      const branchAngle = (b / branches) * Math.PI / 2;
      const dataIdx = Math.floor((b / branches) * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const baseLength = maxReach * 0.8 + eq.bass * 0.6;
      const length = baseLength + value / 3 + Math.sin(time * 0.02 + b) * (25 + eq.lowMid / 15);
      const segments = 8;
      for (let seg = 0; seg < segments; seg++) {
        const t = seg / segments;
        const segLength = (length * (1 - t * 0.6)) / segments;
        const x1 = t * length;
        const y1 = 0;
        const x2 = x1 + segLength * Math.cos(branchAngle + Math.sin(time * 0.015 + seg) * (eq.high / 150));
        const y2 = y1 + segLength * Math.sin(branchAngle + Math.sin(time * 0.015 + seg) * (eq.high / 150));
        const hue = (time * 0.5 + seg * 30 + b * 20 + s * 40) % 360;
        const saturation = 70 + eq.highMid / 10;
        const lightness = 50 + eq.presence / 8;
        const alpha = 0.4 + value / 800 + eq.energy / 1200;
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, ${saturation}%, ${lightness - 10}%, ${alpha * 0.5})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3 + eq.subBass / 80 + (1 - t) * 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  const mandalaPetals = 16;
  const mandalaRadius = 50 * scale + eq.energy * 0.4;
  for (let i = 0; i < mandalaPetals; i++) {
    const angle = (i / mandalaPetals) * Math.PI * 2 + time * 0.003;
    const dataIdx = Math.floor((i / mandalaPetals) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const r = mandalaRadius + value / 6;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    const hue = (time * 0.8 + i * 30) % 360;
    const size = 12 + eq.mid / 25;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, `hsla(${hue}, 90%, 65%, 0.8)`);
    gradient.addColorStop(1, `hsla(${hue}, 80%, 50%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLiquidPlasma(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;
  const blobCount = Math.floor(8 + eq.energy / 35);
  for (let i = 0; i < blobCount; i++) {
    const orbitAngle = (i / blobCount) * Math.PI * 2 + time * 0.001 * (i % 2 === 0 ? 1 : -1);
    const orbitRadius = 140 * scale + Math.sin(time * 0.005 + i) * (70 + eq.bass / 4);
    const dataIdx = Math.floor((i / blobCount) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const blobX = centerX + Math.cos(orbitAngle) * (orbitRadius + eq.lowMid / 4);
    const blobY = centerY + Math.sin(orbitAngle) * (orbitRadius + eq.lowMid / 4);
    const blobSize = 70 * scale + value / 3 + eq.bass * 0.6 + Math.sin(time * 0.02 + i * 0.7) * 30;
    for (let l = 0; l < 4; l++) {
      const layerSize = blobSize * (1 - l * 0.2);
      const hue = (time * 0.4 + i * 60 + l * 90) % 360;
      const saturation = 85 + eq.high / 10;
      const gradient = ctx.createRadialGradient(blobX, blobY, 0, blobX, blobY, layerSize);
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, 60%, ${0.5 + eq.mid / 900})`);
      gradient.addColorStop(0.5, `hsla(${(hue + 30) % 360}, ${saturation}%, 55%, ${0.3 + eq.mid / 1300})`);
      gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, 45%, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(blobX, blobY, layerSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const waveCount = Math.floor(6 + eq.high / 45);
  for (let w = 0; w < waveCount; w++) {
    const wavePhase = time * 0.003 + w * (Math.PI * 2 / waveCount);
    const points = 120;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const angle = t * Math.PI * 2;
      const dataIdx = Math.floor(t * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const baseR = (180 + w * 40) * scale;
      const wave1 = Math.sin(angle * 4 + wavePhase) * (18 + eq.highMid / 12);
      const wave2 = Math.sin(angle * 7 - wavePhase * 1.3) * (12 + eq.presence / 16);
      const r = baseR + wave1 + wave2 + value / 12;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const hue = (time * 0.6 + w * 90) % 360;
    ctx.strokeStyle = `hsla(${hue}, 85%, 60%, ${0.2 + eq.highMid / 1800})`;
    ctx.lineWidth = 2.5 + eq.energy / 120;
    ctx.stroke();
  }
}

function drawSpiralGalaxy(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;
  const maxReach = Math.max(width, height) * 0.6;
  const arms = 5;
  const rotationSpeed = 0.0015 * (1 + eq.bass / 150);
  for (let arm = 0; arm < arms; arm++) {
    const armOffset = (arm / arms) * Math.PI * 2;
    const points = 200;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const t = i / points;
      const angle = t * Math.PI * 8 + time * rotationSpeed + armOffset;
      const dataIdx = Math.floor(t * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const r = t * (maxReach + eq.bass * 0.5) + value / 6 + Math.sin(angle * 2) * (12 + eq.lowMid / 20);
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      if (i % 2 === 0) {
        const starSize = 1.5 + value / 100 + eq.high / 120;
        const hue = (140 + t * 120 + arm * 60) % 360;
        const saturation = 70 + eq.highMid / 8;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, starSize * 3);
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, 70%, 0.7)`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, 50%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, starSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const hue = 200 + arm * 40;
    ctx.strokeStyle = `hsla(${hue}, 75%, 60%, 0.2)`;
    ctx.lineWidth = 4 + eq.mid / 80;
    ctx.stroke();
  }
  const coreSize = 50 * scale + eq.subBass * 0.8 + eq.bass * 0.5;
  const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize);
  coreGradient.addColorStop(0, `hsla(320, 100%, 85%, 0.9)`);
  coreGradient.addColorStop(0.3, `hsla(310, 95%, 75%, 0.6)`);
  coreGradient.addColorStop(0.7, `hsla(290, 85%, 65%, 0.3)`);
  coreGradient.addColorStop(1, `hsla(270, 75%, 55%, 0)`);
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
  ctx.fill();
}

function drawCrystalLattice(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;
  // Slightly larger spacing → fewer cells; bass only nudges size
  const hexSize = (26 + eq.bass / 20) * scale;
  const cols = Math.ceil(width / (hexSize * 1.5)) + 2;
  const rows = Math.ceil(height / (hexSize * Math.sqrt(3))) + 2;

  // Slow / fast phases for rhythmic patterns (no per-frame random → no flicker)
  const tSlow = time * 0.014;
  const tMed = time * 0.045;
  const tRing = time * 0.022;
  const energyNorm = Math.min(1, eq.energy / 255);

  // Global “how much lattice” breathes — keeps screen from ever feeling full
  const breath = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(tSlow * 0.85));
  const accent = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(tMed + energyNorm * Math.PI));

  const smooth01 = (x: number, lo: number, hi: number) => {
    if (x <= lo) return 0;
    if (x >= hi) return 1;
    return (x - lo) / (hi - lo);
  };

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const offsetX = (row % 2) * hexSize * 0.75;
      const x = col * hexSize * 1.5 + offsetX;
      const y = row * hexSize * Math.sqrt(3) * 0.5;
      const dx = x - centerX;
      const dy = y - centerY;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(width, height) * 0.62;
      const distT = Math.min(1, distFromCenter / maxDist);

      // Stable per-cell phase (deterministic “identity”)
      const cr = row + 100;
      const cc = col + 100;
      const id01 = 0.5 + 0.5 * Math.sin(cr * 127.1 + cc * 311.7);

      const dataIdx = Math.floor((distT * 0.97 + id01 * 0.03) * bufferLength) % bufferLength;
      const value = dataArray[dataIdx] || 0;

      // Interference lattice: traveling waves that form / dissolve patterns
      const waveA = Math.sin(cr * 0.52 + cc * 0.52 + tSlow);
      const waveB = Math.cos(cr * 0.48 - cc * 0.48 + tSlow * 1.1);
      const waveC = Math.sin(distFromCenter * 0.028 - tRing + id01 * Math.PI * 2);
      const interference = (waveA * waveB * 0.55 + waveC * 0.45 + 1) * 0.5;

      // Sparse ridges: only stronger lines survive → not a solid wall of tiles
      let visibility = smooth01(interference, 0.38, 0.92);
      visibility = Math.pow(visibility, 1.65);

      // Edge falloff: fewer tiles at perimeter
      visibility *= 1 - distT * 0.55;

      // Audio nudges pattern contrast slightly (smoothed input already)
      visibility *= breath * accent * (0.72 + energyNorm * 0.35);
      visibility *= 0.85 + (value / 255) * 0.22;

      if (visibility < 0.035) continue;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 0.00055 * (1 - distT) + distFromCenter * 0.004);
      // Gentle pulse — much slower than before to avoid shimmer
      const pulse =
        Math.sin(tMed * 0.35 - distFromCenter * 0.018 + id01 * Math.PI) *
        (3.5 + eq.lowMid / 55);
      const size = hexSize * (0.58 + distT * 0.28) + pulse + value / 90;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const hx = Math.cos(angle) * size;
        const hy = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      const hue = (time * 0.22 + distFromCenter * 1.6 + value / 6 + id01 * 40) % 360;
      const saturation = 78 + eq.high / 10;
      const lightness = 48 + eq.highMid / 12;
      const baseAlpha = visibility * (0.22 + (1 - distT) * 0.38);
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${baseAlpha * 0.45})`;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, ${saturation + 8}%, ${lightness + 12}%, ${baseAlpha * 0.92})`;
      ctx.lineWidth = 1.1 + eq.bass / 140 + (1 - distT) * 1.6;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Fewer rays; strength follows slow rhythm so they don’t compete with the lattice
  const rayPulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(tSlow * 1.1));
  const rayCount = Math.floor((7 + eq.presence / 28) * rayPulse);
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / Math.max(1, rayCount)) * Math.PI * 2 + time * 0.0016;
    const dataIdx = Math.floor((i / Math.max(1, rayCount)) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const maxReach = Math.max(width, height) * 0.45;
    const rayLength = maxReach * (0.65 + rayPulse * 0.35) + value / 2.2 + eq.highMid * 0.55;
    const x2 = centerX + Math.cos(angle) * rayLength;
    const y2 = centerY + Math.sin(angle) * rayLength;
    const hue = (time * 0.35 + i * (360 / Math.max(1, rayCount))) % 360;
    const rayAlpha = 0.22 * rayPulse + value / 2200;
    const gradient = ctx.createLinearGradient(centerX, centerY, x2, y2);
    gradient.addColorStop(0, `hsla(${hue}, 88%, 68%, ${rayAlpha})`);
    gradient.addColorStop(1, `hsla(${hue}, 82%, 58%, 0)`);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2 + eq.subBass / 110;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
