import type { EQBands } from '../types';
import { Particle } from '../Particle';

export function drawOrganicFlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number,
  options?: { particles?: Particle[]; isPlaying?: boolean }
): void {
  const particles = options?.particles ?? [];
  const isPlaying = options?.isPlaying ?? false;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) / 400;

  const targetParticles = Math.floor(120 + eq.energy / 2);
  const spawnRate = Math.ceil(eq.mid / 30);

  if (isPlaying && particles.length < targetParticles) {
    for (let i = 0; i < spawnRate && particles.length < targetParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 150 * scale + 50 * scale;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const vx = (Math.random() - 0.5) * (eq.highMid / 120);
      const vy = (Math.random() - 0.5) * (eq.highMid / 120);
      const hue = 260 + Math.random() * 80;
      particles.push(new Particle(x, y, vx, vy, Math.random() * 20 + 10 + eq.bass / 30, hue));
    }
  }

  const flow = eq.bass / 40;
  const turbulence = eq.high / 50;
  const living: Particle[] = [];
  for (const p of particles) {
    p.update(width, height, flow, turbulence, time);
    p.draw(ctx, 0.6 + eq.mid / 400);
    if (!p.isDead()) living.push(p);
  }
  particles.length = 0;
  particles.push(...living);

  const gridSize = Math.max(20, 50 - eq.mid / 10);
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * gridSize;
      const y = j * gridSize;
      const dataIdx = Math.floor(((i + j) / (cols + rows)) * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const angle = (x * 0.008 + y * 0.008 + time * 0.008 * (eq.presence / 100)) * Math.PI;
      const length = 20 + value / 10 + eq.bass / 12;
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;
      ctx.strokeStyle = `hsla(280, 70%, 55%, ${0.15 + value / 1200 + eq.mid / 1200})`;
      ctx.lineWidth = 1.5 + eq.energy / 120;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  const attractorRadius = 80 * scale + eq.bass * 1.2 + eq.subBass * 0.8;
  const segments = 80;
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const dataIdx = Math.floor((i / segments) * bufferLength);
    const value = dataArray[dataIdx] || 0;
    const r = attractorRadius + Math.sin(i * 0.5 + time * 0.02) * (20 + value / 20 + eq.lowMid / 10);
    const px = centerX + Math.cos(angle) * r;
    const py = centerY + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = `hsla(280, 80%, 65%, ${0.4 + eq.bass / 400})`;
  ctx.lineWidth = 2 + eq.subBass / 60;
  ctx.stroke();
  ctx.strokeStyle = `hsla(290, 70%, 60%, ${0.25 + eq.bass / 700})`;
  ctx.lineWidth = 12 + eq.bass / 30;
  ctx.stroke();

  for (let r = 0; r < 5; r++) {
    const ringRadius = attractorRadius + (r + 1) * 40 * scale;
    const ringSegments = 60;
    ctx.beginPath();
    for (let i = 0; i <= ringSegments; i++) {
      const angle = (i / ringSegments) * Math.PI * 2 + time * 0.003 * (r % 2 === 0 ? 1 : -1);
      const dataIdx = Math.floor((i / ringSegments) * bufferLength);
      const value = dataArray[dataIdx] || 0;
      const rd = ringRadius + Math.sin(i * 0.8 + time * 0.015) * (15 + value / 30);
      const px = centerX + Math.cos(angle) * rd;
      const py = centerY + Math.sin(angle) * rd;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `hsla(${270 + r * 15}, 75%, 58%, ${0.2 + eq.energy / 1500})`;
    ctx.lineWidth = 1.5 + eq.bass / 100;
    ctx.stroke();
  }
}
